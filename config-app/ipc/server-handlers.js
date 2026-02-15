const { ipcMain, BrowserWindow, session, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const http = require('http');
const { spawn } = require('child_process');
const { CONFIG_DIR, DEFAULT_SERVER_PORT, checkPortAvailable } = require('../lib/config-service');
const {
  getMainWindow, getClientWindow, setClientWindow,
  getServerState, setServerState, clearServerState
} = require('./shared-state');

let sseConnection = null;
let sseReconnectAttempts = 0;

async function startOpencodeServer(cwd, port) {
  const { process: existing } = getServerState();
  if (existing) return { success: false, error: 'Server already running' };

  const available = await checkPortAvailable(port);
  if (!available) return { success: false, error: `Port ${port} is already in use` };

  const password = crypto.randomBytes(16).toString('hex');
  const opencodePaths = [
    '/opt/homebrew/bin/opencode',
    '/usr/local/bin/opencode',
    path.join(os.homedir(), '.local/bin/opencode'),
    path.join(os.homedir(), 'go/bin/opencode'),
    'opencode'
  ];

  let opencodeBin = 'opencode';
  for (const p of opencodePaths) {
    if (p === 'opencode' || fs.existsSync(p)) { opencodeBin = p; break; }
  }

  const proc = spawn(opencodeBin, ['serve', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd,
    env: { ...process.env, OPENCODE_PASSWORD: password },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  setServerState({ process: proc, port, password, cwd });

  proc.stdout.on('data', (data) => {
    console.log('[opencode-server]', data.toString());
    const cw = getClientWindow();
    if (cw && !cw.isDestroyed()) cw.webContents.send('opencode-server-log', data.toString());
  });

  proc.stderr.on('data', (data) => {
    console.error('[opencode-server]', data.toString());
    const cw = getClientWindow();
    if (cw && !cw.isDestroyed()) cw.webContents.send('opencode-server-log', data.toString());
  });

  proc.on('close', (code) => {
    console.log('[opencode-server] Exited with code:', code);
    setServerState({ process: null });
    const cw = getClientWindow();
    if (cw && !cw.isDestroyed()) cw.webContents.send('opencode-server-status', { running: false, code });
  });

  const healthy = await new Promise((resolve) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startTime > 30000) { clearInterval(interval); resolve(false); return; }
      const req = http.get(`http://127.0.0.1:${port}/global/health`, (res) => {
        if (res.statusCode === 200) { clearInterval(interval); resolve(true); }
        res.resume();
      });
      req.on('error', () => {});
      req.setTimeout(2000, () => req.destroy());
    }, 500);
  });

  if (!healthy) { stopOpencodeServer(); return { success: false, error: 'Health check timeout after 30s' }; }
  startSSEConnection(port, password);
  return { success: true, port, password };
}

function startSSEConnection(port, password) {
  if (sseConnection) sseConnection.destroy();
  const auth = Buffer.from(`opencode:${password}`).toString('base64');
  const req = http.request({
    hostname: '127.0.0.1', port, path: '/event', method: 'GET',
    headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'text/event-stream' }
  }, (res) => {
    sseReconnectAttempts = 0;
    let buffer = '';
    res.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const eventData = JSON.parse(line.slice(6));
            const cw = getClientWindow();
            if (cw && !cw.isDestroyed()) cw.webContents.send('opencode-event', eventData);
          } catch (e) { console.error('[SSE] Parse error:', e); }
        }
      }
    });
    res.on('end', () => reconnectSSE(port, password));
  });
  req.on('error', () => reconnectSSE(port, password));
  req.end();
  sseConnection = req;
}

function reconnectSSE(port, password) {
  const { process: proc } = getServerState();
  if (!proc) return;
  sseReconnectAttempts++;
  const delay = Math.min(1000 * Math.pow(2, sseReconnectAttempts - 1), 5000);
  setTimeout(() => {
    const { process: p } = getServerState();
    if (p) startSSEConnection(port, password);
  }, delay);
}

function stopOpencodeServer() {
  if (sseConnection) { sseConnection.destroy(); sseConnection = null; }
  sseReconnectAttempts = 0;
  const { process: proc } = getServerState();
  if (proc) { try { proc.kill('SIGTERM'); } catch (e) {} }
  clearServerState();
  return { success: true };
}

function createClientWindow() {
  if (getClientWindow()) { getClientWindow().focus(); return; }
  const { port, password, cwd } = getServerState();
  if (!port || !password) { console.error('[client-window] Server not running'); return; }

  const encodedDir = cwd ? encodeURIComponent(cwd) : '';
  const clientSession = session.fromPartition('persist:opencode-client');
  clientSession.webRequest.onBeforeSendHeaders(
    { urls: [`http://127.0.0.1:${port}/*`] },
    (details, callback) => {
      const auth = Buffer.from(`opencode:${password}`).toString('base64');
      details.requestHeaders['Authorization'] = `Basic ${auth}`;
      if (encodedDir) {
        details.requestHeaders['x-opencode-directory'] = encodedDir;
      }
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  const win = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: { session: clientSession, contextIsolation: true, nodeIntegration: false },
    titleBarStyle: 'hiddenInset', backgroundColor: '#131010'
  });
  const url = encodedDir
    ? `http://127.0.0.1:${port}?directory=${encodedDir}`
    : `http://127.0.0.1:${port}`;
  win.loadURL(url);
  win.on('closed', () => { setClientWindow(null); stopOpencodeServer(); });
  setClientWindow(win);
}

function register() {
  ipcMain.handle('opencode-server-start', async (event, cwd) => {
    return await startOpencodeServer(cwd, DEFAULT_SERVER_PORT);
  });

  ipcMain.handle('opencode-server-stop', async () => stopOpencodeServer());

  ipcMain.handle('opencode-server-status', async () => {
    const { process: proc, port, password, cwd } = getServerState();
    return { running: proc !== null, port, password, cwd };
  });

  ipcMain.handle('client-open-directory', async () => {
    return await dialog.showOpenDialog({ properties: ['openDirectory'] });
  });

  ipcMain.handle('client-open-file', async (event, options) => {
    return await dialog.showOpenDialog({ properties: ['openFile'], ...options });
  });

  ipcMain.handle('client-get-password', async () => getServerState().password);

  ipcMain.handle('get-app-version', async () => {
    const { app } = require('electron');
    return app.getVersion();
  });

  ipcMain.handle('open-client-window', async () => {
    const mw = getMainWindow();
    const result = await dialog.showOpenDialog(mw, {
      properties: ['openDirectory'],
      title: '选择工作目录'
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { success: false, error: 'No directory selected' };
    }

    const cwd = result.filePaths[0];
    const { process: proc, cwd: currentCwd } = getServerState();

    // server 已在运行但目录不同，需要重启
    if (proc && currentCwd !== cwd) {
      const cw = getClientWindow();
      if (cw && !cw.isDestroyed()) {
        cw.removeAllListeners('closed');
        cw.close();
        setClientWindow(null);
      }
      stopOpencodeServer();
    }

    if (!getServerState().process) {
      const startResult = await startOpencodeServer(cwd, DEFAULT_SERVER_PORT);
      if (!startResult.success) {
        return { success: false, error: startResult.error };
      }
    }

    const cw = getClientWindow();
    if (cw) { cw.focus(); }
    else { createClientWindow(); }
    return { success: true, dir: cwd };
  });

  ipcMain.handle('open-client-window-with-dir', async (event, dir) => {
    if (!dir) {
      return { success: false, error: 'No directory provided' };
    }

    const { process: proc, cwd: currentCwd } = getServerState();

    // 如果 server 已在运行但目录不同，需要重启
    if (proc && currentCwd !== dir) {
      const cw = getClientWindow();
      if (cw && !cw.isDestroyed()) {
        cw.removeAllListeners('closed');
        cw.close();
        setClientWindow(null);
      }
      stopOpencodeServer();

      const startResult = await startOpencodeServer(dir, DEFAULT_SERVER_PORT);
      if (!startResult.success) {
        return { success: false, error: startResult.error };
      }
      createClientWindow();
      return { success: true };
    }

    // server 已在运行且目录相同，直接 focus
    if (proc) {
      const cw = getClientWindow();
      if (cw) { cw.focus(); }
      else { createClientWindow(); }
      return { success: true };
    }

    // server 未运行，启动新 server
    const startResult = await startOpencodeServer(dir, DEFAULT_SERVER_PORT);
    if (!startResult.success) {
      return { success: false, error: startResult.error };
    }

    createClientWindow();
    return { success: true };
  });
}

module.exports = { register, stopOpencodeServer };
