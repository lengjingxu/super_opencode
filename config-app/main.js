const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { copyDirSync } = require("./lib/utils");
const { execSync, exec, spawn } = require('child_process');
const crypto = require('crypto');
const http = require('http');
const { initAutoUpdater } = require('./updater');

const CONFIG_DIR = path.join(os.homedir(), '.config', 'opencode');
const CONFIG_APP_DIR = path.join(CONFIG_DIR, 'config-app');
const AUTH_DIR = path.join(os.homedir(), '.local', 'share', 'opencode');
const SKILLS_DIR = path.join(CONFIG_DIR, 'skills');
const HOOKS_DIR = path.join(CONFIG_DIR, 'hooks');
const CREDENTIALS_PATH = path.join(CONFIG_DIR, 'credentials.json');  // 统一凭证文件路径

// 打包后资源在 process.resourcesPath，开发时在项目目录
const APP_DIR = app.isPackaged 
  ? process.resourcesPath 
  : __dirname;

let mainWindow;
let opencodeServerProcess = null;
let opencodeServerPort = null;
let opencodeServerPassword = null;
let opencodeServerCwd = null;
let clientWindow = null;  // Will be used by Task 4

// 安装/更新 skills 到配置目录
function installSkills() {
  const skillsSourceDir = path.join(APP_DIR, 'skills');
  if (fs.existsSync(skillsSourceDir)) {
    if (!fs.existsSync(SKILLS_DIR)) {
      fs.mkdirSync(SKILLS_DIR, { recursive: true });
    }
    copyDirSync(skillsSourceDir, SKILLS_DIR);
    console.log('[startup] Skills installed from:', skillsSourceDir, 'to:', SKILLS_DIR);
    return true;
  } else {
    console.log('[startup] Skills source dir not found:', skillsSourceDir);
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff'
  });

  mainWindow.loadFile('src/index.html');
}

async function startOpencodeServer(cwd, port) {
  if (opencodeServerProcess) {
    return { success: false, error: 'Server already running' };
  }

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
    if (p === 'opencode' || fs.existsSync(p)) {
      opencodeBin = p;
      break;
    }
  }

  opencodeServerProcess = spawn(opencodeBin, ['serve', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd,
    env: { ...process.env, OPENCODE_PASSWORD: password },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  opencodeServerPort = port;
  opencodeServerPassword = password;
  opencodeServerCwd = cwd;

  opencodeServerProcess.stdout.on('data', (data) => {
    console.log('[opencode-server]', data.toString());
    if (clientWindow) {
      clientWindow.webContents.send('opencode-server-log', data.toString());
    }
  });

  opencodeServerProcess.stderr.on('data', (data) => {
    console.error('[opencode-server]', data.toString());
    if (clientWindow) {
      clientWindow.webContents.send('opencode-server-log', data.toString());
    }
  });

  opencodeServerProcess.on('close', (code) => {
    console.log('[opencode-server] Process exited with code:', code);
    opencodeServerProcess = null;
    if (clientWindow) {
      clientWindow.webContents.send('opencode-server-status', { running: false, code });
    }
  });

  const healthy = await new Promise((resolve) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startTime > 30000) {
        clearInterval(interval);
        resolve(false);
        return;
      }
      const req = http.get(`http://127.0.0.1:${port}/global/health`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve(true);
        }
        res.resume();
      });
      req.on('error', () => {});
      req.setTimeout(2000, () => req.destroy());
    }, 500);
  });

  if (!healthy) {
    stopOpencodeServer();
    return { success: false, error: 'Health check timeout after 30s' };
  }

  startSSEConnection(port, password);

  return { success: true, port, password };
}

let sseConnection = null;
let sseReconnectAttempts = 0;

function startSSEConnection(port, password) {
  if (sseConnection) {
    sseConnection.destroy();
  }

  const auth = Buffer.from(`opencode:${password}`).toString('base64');
  const options = {
    hostname: '127.0.0.1',
    port: port,
    path: '/event',
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'text/event-stream'
    }
  };

  const req = http.request(options, (res) => {
    sseReconnectAttempts = 0;
    let buffer = '';

    res.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const eventData = JSON.parse(data);
            if (clientWindow && !clientWindow.isDestroyed()) {
              clientWindow.webContents.send('opencode-event', eventData);
            }
          } catch (e) {
            console.error('[SSE] Parse error:', e);
          }
        }
      }
    });

    res.on('end', () => {
      console.log('[SSE] Connection ended');
      reconnectSSE(port, password);
    });
  });

  req.on('error', (err) => {
    console.error('[SSE] Connection error:', err);
    reconnectSSE(port, password);
  });

  req.end();
  sseConnection = req;
}

function reconnectSSE(port, password) {
  if (!opencodeServerProcess) return;

  sseReconnectAttempts++;
  const delay = Math.min(1000 * Math.pow(2, sseReconnectAttempts - 1), 5000);
  
  console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${sseReconnectAttempts})`);
  
  setTimeout(() => {
    if (opencodeServerProcess) {
      startSSEConnection(port, password);
    }
  }, delay);
}

function stopOpencodeServer() {
  if (sseConnection) {
    sseConnection.destroy();
    sseConnection = null;
  }
  sseReconnectAttempts = 0;
  
  if (opencodeServerProcess) {
    try { opencodeServerProcess.kill('SIGTERM'); } catch (e) {}
    opencodeServerProcess = null;
  }
  opencodeServerPort = null;
  opencodeServerPassword = null;
  opencodeServerCwd = null;
  return { success: true };
}

function createClientWindow() {
  if (clientWindow) {
    clientWindow.focus();
    return;
  }

  clientWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'client-preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff'
  });

  const isDev = process.argv.includes('--dev');
  if (isDev) {
    clientWindow.loadURL('http://localhost:5173');
  } else {
    clientWindow.loadFile(path.join(__dirname, 'client-dist', 'index.html'));
  }

  clientWindow.on('closed', () => {
    clientWindow = null;
    stopOpencodeServer();
  });
}

app.whenReady().then(() => {
  installSkills();
  createWindow();
  
  initAutoUpdater(mainWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (opencodeServerProcess) {
    try { opencodeServerProcess.kill('SIGTERM'); } catch (e) {}
    opencodeServerProcess = null;
  }
});

ipcMain.handle('opencode-server-start', async (event, cwd) => {
  const port = 4096;
  return await startOpencodeServer(cwd, port);
});

ipcMain.handle('opencode-server-stop', async () => {
  return stopOpencodeServer();
});

ipcMain.handle('opencode-server-status', async () => {
  return {
    running: opencodeServerProcess !== null,
    port: opencodeServerPort,
    password: opencodeServerPassword,
    cwd: opencodeServerCwd
  };
});

ipcMain.handle('client-open-directory', async () => {
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result;
});

ipcMain.handle('client-open-file', async (event, options) => {
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    ...options
  });
  return result;
});

ipcMain.handle('client-get-password', async () => {
  return opencodeServerPassword;
});

ipcMain.handle('get-app-version', async () => {
  return app.getVersion();
});

ipcMain.handle('open-client-window', async () => {
  createClientWindow();
  return { success: true };
});

ipcMain.handle('install-skills', async () => {
  try {
    const result = installSkills();
    return { success: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-config', async (event, filename) => {
  const filePath = path.join(CONFIG_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data: JSON.parse(content) };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-config', async (event, filename, data) => {
  const filePath = path.join(CONFIG_DIR, filename);
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-config-app-file', async (event, filename) => {
  const filePath = path.join(CONFIG_APP_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data: JSON.parse(content) };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-config-app-file', async (event, filename, data) => {
  const filePath = path.join(CONFIG_APP_DIR, filename);
  try {
    if (!fs.existsSync(CONFIG_APP_DIR)) {
      fs.mkdirSync(CONFIG_APP_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-agents-md', async () => {
  const filePath = path.join(CONFIG_DIR, 'AGENTS.md');
  try {
    if (fs.existsSync(filePath)) {
      return { success: true, data: fs.readFileSync(filePath, 'utf-8') };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-agents-md', async (event, content) => {
  const filePath = path.join(CONFIG_DIR, 'AGENTS.md');
  try {
    fs.writeFileSync(filePath, content);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-config-dir', async () => {
  return CONFIG_DIR;
});

ipcMain.handle('load-all-configs', async () => {
  try {
    const configs = {
      opencode: null,
      ohMyOpencode: null,
      auth: null
    };
    
    const opencodeFile = path.join(CONFIG_DIR, 'opencode.json');
    if (fs.existsSync(opencodeFile)) {
      configs.opencode = JSON.parse(fs.readFileSync(opencodeFile, 'utf-8'));
    }
    
    const ohMyFile = path.join(CONFIG_DIR, 'oh-my-opencode.json');
    if (fs.existsSync(ohMyFile)) {
      configs.ohMyOpencode = JSON.parse(fs.readFileSync(ohMyFile, 'utf-8'));
    }
    
    const authFile = path.join(AUTH_DIR, 'auth.json');
    if (fs.existsSync(authFile)) {
      configs.auth = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
    }
    
    return { success: true, configs };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-config-with-backup', async (event, configType, data) => {
  try {
    let filePath;
    if (configType === 'opencode') {
      filePath = path.join(CONFIG_DIR, 'opencode.json');
    } else if (configType === 'oh-my-opencode') {
      filePath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
    } else if (configType === 'auth') {
      filePath = path.join(AUTH_DIR, 'auth.json');
    } else {
      return { success: false, error: 'Unknown config type' };
    }
    
    const backupDir = path.join(CONFIG_DIR, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    if (fs.existsSync(filePath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `${configType}-${timestamp}.json`;
      const backupPath = path.join(backupDir, backupName);
      fs.copyFileSync(filePath, backupPath);
      
      const backups = fs.readdirSync(backupDir)
        .filter(f => f.startsWith(configType + '-'))
        .sort()
        .reverse();
      if (backups.length > 10) {
        backups.slice(10).forEach(f => {
          fs.unlinkSync(path.join(backupDir, f));
        });
      }
    }
    
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-backups', async (event, configType) => {
  try {
    const backupDir = path.join(CONFIG_DIR, 'backups');
    if (!fs.existsSync(backupDir)) {
      return { success: true, backups: [] };
    }
    
    const backups = fs.readdirSync(backupDir)
      .filter(f => !configType || f.startsWith(configType + '-'))
      .map(f => ({
        name: f,
        path: path.join(backupDir, f),
        time: fs.statSync(path.join(backupDir, f)).mtime
      }))
      .sort((a, b) => b.time - a.time);
    
    return { success: true, backups };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('restore-backup', async (event, backupName) => {
  try {
    const backupDir = path.join(CONFIG_DIR, 'backups');
    const backupPath = path.join(backupDir, backupName);
    
    if (!fs.existsSync(backupPath)) {
      return { success: false, error: 'Backup not found' };
    }
    
    const configType = backupName.split('-')[0];
    let targetPath;
    if (configType === 'opencode') {
      targetPath = path.join(CONFIG_DIR, 'opencode.json');
    } else if (configType === 'oh') {
      targetPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
    } else if (configType === 'auth') {
      targetPath = path.join(AUTH_DIR, 'auth.json');
    } else {
      return { success: false, error: 'Unknown backup type' };
    }
    
    fs.copyFileSync(backupPath, targetPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-install-status', async () => {
  const status = {
    opencode: false,
    ohMyOpencode: false,
    configExists: false,
    needsSetup: true,
    uiuxProMax: false,
    imageGenerator: false
  };
  
  try {
    execSync('which opencode', { stdio: 'pipe' });
    status.opencode = true;
  } catch (e) {}
  
  try {
    const omoConfigPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
    if (fs.existsSync(omoConfigPath)) {
      status.ohMyOpencode = true;
    }
  } catch (e) {}
  
  status.configExists = fs.existsSync(path.join(CONFIG_DIR, 'oh-my-opencode.json'));
  
  const uiuxSkillPath = path.join(CONFIG_DIR, 'skills', 'ui-ux-pro-max');
  const uiuxSkillPath2 = path.join(os.homedir(), '.claude', 'skills', 'ui-ux-pro-max');
  status.uiuxProMax = fs.existsSync(uiuxSkillPath) || fs.existsSync(uiuxSkillPath2);
  
  const imageGenSkillPath = path.join(CONFIG_DIR, 'skills', 'image-generator');
  const imageGenSkillPath2 = path.join(os.homedir(), '.claude', 'skills', 'image-generator');
  status.imageGenerator = fs.existsSync(imageGenSkillPath) || fs.existsSync(imageGenSkillPath2);
  
  status.needsSetup = !status.opencode || !status.configExists;
  
  return status;
});

ipcMain.handle('install-opencode', async () => {
  return new Promise((resolve) => {
    const cmd = 'curl -fsSL https://opencode.ai/install | bash';
    
    exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true });
      }
    });
  });
});

ipcMain.handle('install-oh-my-opencode', async () => {
  return new Promise((resolve) => {
    exec('bunx oh-my-opencode install --no-tui --claude=no --gemini=no --copilot=no', (error, stdout, stderr) => {
      if (error) {
        exec('npx oh-my-opencode install --no-tui --claude=no --gemini=no --copilot=no', (error2, stdout2, stderr2) => {
          if (error2) {
            resolve({ success: false, error: error2.message });
          } else {
            resolve({ success: true });
          }
        });
      } else {
        resolve({ success: true });
      }
    });
  });
});

ipcMain.handle('install-plugins', async () => {
  const plugins = ['opencode-notificator', 'opencode-supermemory', 'opencode-dynamic-context-pruning'];
  const results = [];
  
  for (const plugin of plugins) {
    try {
      await new Promise((resolve, reject) => {
        exec(`opencode plugin add ${plugin}`, { timeout: 30000 }, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      results.push({ plugin, success: true });
    } catch (e) {
      console.log(`[install-plugins] Failed to install ${plugin}:`, e.message);
      results.push({ plugin, success: false, error: e.message });
    }
  }
  
  return results;
});

ipcMain.handle('install-uiux-skill', async () => {
  return new Promise((resolve) => {
    const cmd = 'npx uipro init --ai opencode --yes 2>/dev/null || bunx uipro init --ai opencode --yes 2>/dev/null';
    exec(cmd, { timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true });
      }
    });
  });
});

ipcMain.handle('check-skill-installed', async (event, skillName) => {
  const skillPath1 = path.join(CONFIG_DIR, 'skills', skillName);
  const skillPath2 = path.join(os.homedir(), '.claude', 'skills', skillName);
  const installed = fs.existsSync(skillPath1) || fs.existsSync(skillPath2);
  return { installed, path: installed ? (fs.existsSync(skillPath1) ? skillPath1 : skillPath2) : null };
});

ipcMain.handle('install-image-generator-skill', async (event, serviceUrl, apiKey) => {
  try {
    let cred = {};
    if (fs.existsSync(CREDENTIALS_PATH)) {
      cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    }
    cred.image_generator = {
      enabled: true,
      api_key: apiKey || '',
      base_url: serviceUrl || 'http://localhost:7860'
    };
    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(cred, null, 2));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-fc-config', async () => {
  try {
    if (fs.existsSync(CREDENTIALS_PATH)) {
      const cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
      const fcConfig = cred.deploy?.aliyun_fc || {};
      const data = {
        accounts: fcConfig.accounts || [],
        default_account: fcConfig.default_account || ''
      };
      if (data.accounts.length > 0) {
        data.accounts = data.accounts.map(acc => ({
          ...acc,
          access_key_secret: acc.access_key_secret ? '••••••••' : ''
        }));
      }
      return { success: true, data };
    }
    return { success: true, data: { accounts: [], default_account: '' } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-fc-config', async (event, config) => {
  try {
    let cred = {};
    if (fs.existsSync(CREDENTIALS_PATH)) {
      cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    }
    
    cred.deploy = cred.deploy || {};
    const existingAccounts = {};
    if (cred.deploy.aliyun_fc?.accounts) {
      cred.deploy.aliyun_fc.accounts.forEach(acc => {
        if (acc.name && acc.access_key_secret) {
          existingAccounts[acc.name] = acc.access_key_secret;
        }
      });
    }
    
    if (config.accounts) {
      config.accounts = config.accounts.map(acc => {
        if (acc.access_key_secret === '••••••••' && acc.name && existingAccounts[acc.name]) {
          return { ...acc, access_key_secret: existingAccounts[acc.name] };
        }
        return acc;
      });
    }
    
    cred.deploy.aliyun_fc = {
      enabled: true,
      accounts: config.accounts || [],
      default_account: config.default_account || ''
    };
    
    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(cred, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-sql-config', async () => {
  try {
    if (fs.existsSync(CREDENTIALS_PATH)) {
      const cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
      const data = { connections: cred.database || {} };
      if (data.connections) {
        for (const key of Object.keys(data.connections)) {
          if (data.connections[key].password) {
            data.connections[key].password = '••••••••';
          }
        }
      }
      return { success: true, data };
    }
    return { success: true, data: { connections: {} } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-sql-config', async (event, config) => {
  try {
    let cred = {};
    if (fs.existsSync(CREDENTIALS_PATH)) {
      cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    }
    
    const existingPasswords = {};
    if (cred.database) {
      for (const [key, conn] of Object.entries(cred.database)) {
        if (conn.password) {
          existingPasswords[key] = conn.password;
        }
      }
    }
    
    if (config.connections) {
      for (const [key, conn] of Object.entries(config.connections)) {
        if (conn.password === '••••••••' && existingPasswords[key]) {
          conn.password = existingPasswords[key];
        }
      }
    }
    
    cred.database = config.connections || {};
    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(cred, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-design-styles', async () => {
  const stylesPath = path.join(APP_DIR, 'templates', 'design-styles.json');
  try {
    if (fs.existsSync(stylesPath)) {
      return { success: true, data: JSON.parse(fs.readFileSync(stylesPath, 'utf-8')) };
    }
    return { success: false, error: 'Design styles not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('setup-config', async (event, options) => {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    if (!fs.existsSync(SKILLS_DIR)) {
      fs.mkdirSync(SKILLS_DIR, { recursive: true });
    }
    if (!fs.existsSync(HOOKS_DIR)) {
      fs.mkdirSync(HOOKS_DIR, { recursive: true });
    }
    
    const templatesDir = path.join(APP_DIR, 'templates');
    const skillsSourceDir = path.join(APP_DIR, 'skills');
    const hooksSourceDir = path.join(APP_DIR, 'hooks');
    const techStacksDir = path.join(APP_DIR, 'tech-stacks');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupDir = path.join(CONFIG_DIR, `backup-${timestamp}`);
    
    const filesToBackup = [
      'oh-my-opencode.json',
      'opencode.json', 
      'AGENTS.md'
    ];
    
    let hasExistingConfig = false;
    for (const file of filesToBackup) {
      if (fs.existsSync(path.join(CONFIG_DIR, file))) {
        hasExistingConfig = true;
        break;
      }
    }
    
    if (hasExistingConfig) {
      fs.mkdirSync(backupDir, { recursive: true });
      for (const file of filesToBackup) {
        const srcPath = path.join(CONFIG_DIR, file);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, path.join(backupDir, file));
        }
      }
    }
    
    // 确保配置目录存在
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.mkdirSync(SKILLS_DIR, { recursive: true });
    fs.mkdirSync(HOOKS_DIR, { recursive: true });
    
    console.log('[setup-config] Templates dir:', templatesDir);
    console.log('[setup-config] Tech stacks dir:', techStacksDir);
    
    // 检查模板目录
    if (!fs.existsSync(templatesDir)) {
      return { success: false, error: `模板目录不存在: ${templatesDir}` };
    }
    
    // 复制模板文件（带错误处理）
    const ohMyOpencodeTemplate = path.join(templatesDir, 'oh-my-opencode.json');
    const opencodeTemplate = path.join(templatesDir, 'opencode.json');
    
    if (!fs.existsSync(ohMyOpencodeTemplate)) {
      return { success: false, error: `模板文件不存在: ${ohMyOpencodeTemplate}` };
    }
    if (!fs.existsSync(opencodeTemplate)) {
      return { success: false, error: `模板文件不存在: ${opencodeTemplate}` };
    }
    
    fs.copyFileSync(ohMyOpencodeTemplate, path.join(CONFIG_DIR, 'oh-my-opencode.json'));
    fs.copyFileSync(opencodeTemplate, path.join(CONFIG_DIR, 'opencode.json'));
    
    if (!fs.existsSync(CONFIG_APP_DIR)) {
      fs.mkdirSync(CONFIG_APP_DIR, { recursive: true });
    }
    const credentialsTemplate = path.join(templatesDir, 'credentials.json.template');
    if (!fs.existsSync(CREDENTIALS_PATH) && fs.existsSync(credentialsTemplate)) {
      fs.copyFileSync(credentialsTemplate, CREDENTIALS_PATH);
    }
    
    const agentsMdTemplate = path.join(templatesDir, 'AGENTS.md.template');
    if (fs.existsSync(agentsMdTemplate)) {
      let agentsMd = fs.readFileSync(agentsMdTemplate, 'utf-8');
      if (options.nickname) {
        agentsMd = agentsMd.replace(/主人/g, options.nickname);
      }
      fs.writeFileSync(path.join(CONFIG_DIR, 'AGENTS.md'), agentsMd);
    }
    
    if (fs.existsSync(skillsSourceDir)) {
      console.log('[setup-config] Copying skills from:', skillsSourceDir, 'to:', SKILLS_DIR);
      copyDirSync(skillsSourceDir, SKILLS_DIR);
      console.log('[setup-config] Skills copied successfully');
    } else {
      console.log('[setup-config] Skills source dir not found:', skillsSourceDir);
    }
    
    if (fs.existsSync(hooksSourceDir)) {
      copyDirSync(hooksSourceDir, HOOKS_DIR);
      const notifyScript = path.join(HOOKS_DIR, 'notify.sh');
      if (fs.existsSync(notifyScript)) {
        fs.chmodSync(notifyScript, '755');
      }
    }
    
    if ((options.frontend || options.designStyle) && fs.existsSync(techStacksDir)) {
      const frontendFile = options.frontend 
        ? path.join(techStacksDir, 'frontend', `${options.frontend}.json`) 
        : null;
      const backendFile = options.backend 
        ? path.join(techStacksDir, 'backend', `${options.backend}.json`) 
        : null;
      
      applyTechStack(
        frontendFile && fs.existsSync(frontendFile) ? frontendFile : null,
        backendFile && fs.existsSync(backendFile) ? backendFile : null,
        options.designStyle || null,
        options.colorPalette || null
      );
    }
    
    if (options.apiKey) {
      let cred = {};
      if (fs.existsSync(CREDENTIALS_PATH)) {
        cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
      }
      cred.model_service = cred.model_service || {};
      cred.model_service.api_key = options.apiKey;
      fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(cred, null, 2));
      
      fs.mkdirSync(AUTH_DIR, { recursive: true });
      const authPath = path.join(AUTH_DIR, 'auth.json');
      let auth = {};
      if (fs.existsSync(authPath)) {
        try {
          auth = JSON.parse(fs.readFileSync(authPath, 'utf-8'));
        } catch (e) {
          auth = {};
        }
      }
      
      const providerName = (options.providerName || 'unified-proxy').trim().toLowerCase().replace(/\s+/g, '-');
      auth[providerName] = {
        type: 'api',
        key: options.apiKey
      };
      fs.writeFileSync(authPath, JSON.stringify(auth, null, 2));
    }
    
    if (options.baseURL || options.providerName) {
      const opencodeConfigPath = path.join(CONFIG_DIR, 'opencode.json');
      const ohMyConfigPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
      
      if (fs.existsSync(opencodeConfigPath)) {
        const config = JSON.parse(fs.readFileSync(opencodeConfigPath, 'utf-8'));
        const providerName = (options.providerName || 'unified-proxy').trim().toLowerCase().replace(/\s+/g, '-');
        const baseURL = (options.baseURL || '').trim().replace(/\/+$/, '');
        
        config.provider = config.provider || {};
        
        if (config.provider['unified-proxy'] && providerName !== 'unified-proxy') {
          config.provider[providerName] = config.provider['unified-proxy'];
          delete config.provider['unified-proxy'];
        }
        
        if (config.provider[providerName]) {
          if (baseURL) {
            config.provider[providerName].options = config.provider[providerName].options || {};
            config.provider[providerName].options.baseURL = baseURL;
          }
          config.provider[providerName].name = options.providerName || '统一代理服务';
        }
        
        fs.writeFileSync(opencodeConfigPath, JSON.stringify(config, null, 2));
        
        if (fs.existsSync(ohMyConfigPath)) {
          let ohMyConfig = JSON.parse(fs.readFileSync(ohMyConfigPath, 'utf-8'));
          
          const models = config.provider[providerName]?.models || {};
          const modelMapping = matchModelsToAgents(providerName, models);
          
          if (modelMapping) {
            ohMyConfig = applyModelMapping(ohMyConfig, modelMapping);
          } else if (providerName !== 'unified-proxy') {
            let ohMyContent = JSON.stringify(ohMyConfig);
            ohMyContent = ohMyContent.replace(/unified-proxy\//g, providerName + '/');
            ohMyConfig = JSON.parse(ohMyContent);
          }
          
          fs.writeFileSync(ohMyConfigPath, JSON.stringify(ohMyConfig, null, 2));
        }
      }
    }
    
    if (options.webhook && options.webhook.enabled && options.webhook.url) {
      let cred = {};
      if (fs.existsSync(CREDENTIALS_PATH)) {
        cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
      }
      cred.notification = {
        webhook: {
          enabled: true,
          platform: options.webhook.platform || 'feishu',
          webhook_url: options.webhook.url,
          secret: options.webhook.secret || ''
        }
      };
      fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(cred, null, 2));
      
      const hookPath = path.join(HOOKS_DIR, 'notify.sh');
      if (fs.existsSync(hookPath)) {
        fs.chmodSync(hookPath, '755');
      }
    }
    
    if (options.database && options.database.enabled) {
      let cred = {};
      if (fs.existsSync(CREDENTIALS_PATH)) {
        cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
      }
      cred.database = cred.database || {};
      cred.database.default = {
        type: options.database.type || 'mysql',
        host: options.database.host,
        port: options.database.port,
        user: options.database.username,
        password: options.database.password,
        database: options.database.database
      };
      fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(cred, null, 2));
    }
    
    if (options.deploy) {
      let cred = {};
      if (fs.existsSync(CREDENTIALS_PATH)) {
        cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
      }
      cred.deploy = cred.deploy || {};
      
      if (options.deploy.fc && options.deploy.fc.enabled) {
        cred.deploy.aliyun_fc = {
          enabled: true,
          access_key_id: options.deploy.fc.accessKeyId,
          access_key_secret: options.deploy.fc.accessKeySecret,
          region: options.deploy.fc.region || 'cn-shanghai'
        };
      }
      
      if (options.deploy.docker && options.deploy.docker.enabled) {
        cred.deploy.docker = {
          enabled: true,
          registry: options.deploy.docker.registry,
          namespace: options.deploy.docker.namespace || '',
          username: options.deploy.docker.username,
          password: options.deploy.docker.password
        };
      }
      
      fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(cred, null, 2));
    }
    
    return { success: true, backupDir: hasExistingConfig ? backupDir : null };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

function applyTechStack(frontendFile, backendFile, designStyle, colorPalette) {
  const configPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  let promptAppend = '';
  
  if (designStyle) {
    const stylesPath = path.join(APP_DIR, 'templates', 'design-styles.json');
    if (fs.existsSync(stylesPath)) {
      const styles = JSON.parse(fs.readFileSync(stylesPath, 'utf-8'));
      const style = styles.styles.find(s => s.id === designStyle);
      const palette = colorPalette ? styles.color_palettes.find(p => p.id === colorPalette) : null;
      
      if (style) {
        promptAppend += `## 设计风格要求\n`;
        promptAppend += `- 风格：${style.name}\n`;
        promptAppend += `- 特点：${style.description}\n`;
        promptAppend += `- 关键词：${style.keywords}\n`;
        promptAppend += `- 使用 /ui-ux-pro-max skill 获取详细设计指南\n\n`;
      }
      
      if (palette) {
        promptAppend += `## 配色方案\n`;
        promptAppend += `- 方案：${palette.name}\n`;
        promptAppend += `- 主色：${palette.colors.primary}\n`;
        promptAppend += `- 辅色：${palette.colors.secondary}\n`;
        promptAppend += `- 强调色：${palette.colors.accent}\n`;
        promptAppend += `- 背景色：${palette.colors.background}\n`;
        promptAppend += `- 文字色：${palette.colors.text}\n\n`;
      }
    }
  }
  
  if (frontendFile && fs.existsSync(frontendFile)) {
    const frontend = JSON.parse(fs.readFileSync(frontendFile, 'utf-8'));
    promptAppend += (frontend.prompt_append || '');
  }
  
  if (backendFile && fs.existsSync(backendFile)) {
    const backend = JSON.parse(fs.readFileSync(backendFile, 'utf-8'));
    if (promptAppend) {
      promptAppend += '\n\n' + (backend.prompt_append || '');
    } else {
      promptAppend = backend.prompt_append || '';
    }
  }
  
  if (promptAppend && config.categories && config.categories['visual-engineering']) {
    config.categories['visual-engineering'].prompt_append = promptAppend;
  }
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

ipcMain.handle('open-config-dir', async () => {
  shell.openPath(CONFIG_DIR);
});

ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('launch-opencode', async (event, mode) => {
  return new Promise((resolve) => {
    let cmd;
    switch (mode) {
      case 'web':
        cmd = 'opencode web';
        break;
      case 'tui':
        cmd = 'opencode';
        break;
      case 'serve':
        cmd = 'opencode serve';
        break;
      default:
        cmd = 'opencode';
    }
    
    exec(cmd, { detached: true, stdio: 'ignore' }, (error) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true });
      }
    });
  });
});

ipcMain.handle('open-web-ui', async () => {
  const configPath = path.join(CONFIG_DIR, 'opencode.json');
  let port = 4096;
  
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.server && config.server.port) {
        port = config.server.port;
      }
    }
  } catch (e) {}
  
  shell.openExternal(`http://localhost:${port}`);
});

ipcMain.handle('get-opencode-config', async () => {
  const configPath = path.join(CONFIG_DIR, 'opencode.json');
  try {
    if (fs.existsSync(configPath)) {
      return { success: true, data: JSON.parse(fs.readFileSync(configPath, 'utf-8')) };
    }
    return { success: true, data: {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-oh-my-opencode-config', async () => {
  const configPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
  try {
    if (fs.existsSync(configPath)) {
      return { success: true, data: JSON.parse(fs.readFileSync(configPath, 'utf-8')) };
    }
    return { success: true, data: {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-opencode-config', async (event, config) => {
  const configPath = path.join(CONFIG_DIR, 'opencode.json');
  try {
    let existingConfig = {};
    if (fs.existsSync(configPath)) {
      existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    const mergedConfig = { ...existingConfig, ...config };
    fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

function matchModelsToAgents(providerName, models) {
  const modelList = Object.keys(models || {});
  if (modelList.length === 0) return null;
  
  const patterns = {
    opus: /opus|o1|4-5.*20251101/i,
    sonnet: /sonnet|4-5(?!.*20251101)/i,
    haiku: /haiku|flash|-mini|fast$/i,
    gemini_pro: /gemini.*pro|gemini-3(?!.*flash)|gemini-2\.5-pro/i,
    gemini_flash: /gemini.*flash|gemini-2\.5-flash/i,
    gpt4: /gpt-4\.1(?!.*mini)|gpt-4o(?!.*mini)|o1/i,
    gpt4_mini: /gpt-4\.1-mini|gpt-4o-mini/i
  };
  
  const matched = {};
  for (const [category, pattern] of Object.entries(patterns)) {
    const found = modelList.find(m => pattern.test(m));
    if (found) matched[category] = `${providerName}/${found}`;
  }
  
  const result = {
    primary: matched.opus || matched.gpt4 || matched.sonnet || modelList[0] && `${providerName}/${modelList[0]}`,
    secondary: matched.sonnet || matched.gpt4_mini || matched.gemini_pro || null,
    fast: matched.haiku || matched.gemini_flash || matched.gpt4_mini || null,
    multimodal: matched.gemini_pro || matched.gemini_flash || null,
    reasoning: matched.gpt4 || matched.opus || null
  };
  
  return result;
}

function applyModelMapping(ohMyConfig, modelMapping) {
  if (!modelMapping) return ohMyConfig;
  
  const agentModelMap = {
    sisyphus: modelMapping.primary,
    oracle: modelMapping.reasoning || modelMapping.primary,
    prometheus: modelMapping.primary,
    explore: modelMapping.fast || modelMapping.secondary,
    librarian: modelMapping.multimodal || modelMapping.secondary,
    'multimodal-looker': modelMapping.multimodal || modelMapping.fast,
    metis: modelMapping.primary,
    momus: modelMapping.reasoning || modelMapping.primary
  };
  
  const categoryModelMap = {
    'visual-engineering': modelMapping.multimodal || modelMapping.secondary,
    'ultrabrain': modelMapping.reasoning || modelMapping.primary,
    'deep': modelMapping.reasoning || modelMapping.primary,
    'artistry': modelMapping.multimodal || modelMapping.secondary,
    'quick': modelMapping.fast,
    'unspecified-low': modelMapping.secondary || modelMapping.fast,
    'unspecified-high': modelMapping.primary,
    'writing': modelMapping.fast || modelMapping.secondary
  };
  
  if (ohMyConfig.agents) {
    for (const [agent, model] of Object.entries(agentModelMap)) {
      if (model && ohMyConfig.agents[agent]) {
        ohMyConfig.agents[agent].model = model;
      }
    }
  }
  
  if (ohMyConfig.categories) {
    for (const [cat, model] of Object.entries(categoryModelMap)) {
      if (model && ohMyConfig.categories[cat]) {
        ohMyConfig.categories[cat].model = model;
      }
    }
  }
  
  return ohMyConfig;
}

const AGENT_RECOMMENDATIONS = {
  sisyphus: { 
    name: '主力执行 (Sisyphus)', 
    role: '核心任务执行，需要强大的代码能力',
    prefer: ['opus', 'gpt4'], 
    tier: 'primary'
  },
  oracle: { 
    name: '架构顾问 (Oracle)', 
    role: '架构审查和调试，需要深度推理',
    prefer: ['gpt4', 'opus'], 
    tier: 'reasoning'
  },
  prometheus: { 
    name: '任务规划 (Prometheus)', 
    role: '任务分解和规划',
    prefer: ['opus', 'gpt4'], 
    tier: 'primary'
  },
  explore: { 
    name: '代码搜索 (Explore)', 
    role: '快速代码搜索，需要速度',
    prefer: ['haiku', 'gemini_flash'], 
    tier: 'fast'
  },
  librarian: { 
    name: '文档查找 (Librarian)', 
    role: '文档和开源项目查找，需要多模态',
    prefer: ['gemini_pro', 'gemini_flash'], 
    tier: 'multimodal'
  },
  'multimodal-looker': { 
    name: '图像分析 (Multimodal)', 
    role: '图片和PDF分析',
    prefer: ['gemini_pro', 'gemini_flash'], 
    tier: 'multimodal'
  },
  metis: { 
    name: '需求分析 (Metis)', 
    role: '发现隐藏意图和歧义',
    prefer: ['opus', 'gpt4'], 
    tier: 'primary'
  },
  momus: { 
    name: '方案审查 (Momus)', 
    role: '严格评审工作计划',
    prefer: ['gpt4', 'opus'], 
    tier: 'reasoning'
  },
  atlas: {
    name: '任务编排 (Atlas)',
    role: '主编排器，管理任务全生命周期，混合调度 Categories 和 Skills',
    prefer: ['sonnet', 'opus', 'gpt4'],
    tier: 'primary'
  },
  hephaestus: {
    name: '深度工作 (Hephaestus)',
    role: '自主深度执行代理，目标导向，先探索后行动，端到端完成',
    prefer: ['gpt4', 'opus'],
    tier: 'reasoning'
  },
  compaction: {
    name: '上下文压缩 (Compaction)',
    role: '会话摘要压缩，推荐便宜快速模型',
    prefer: ['haiku', 'gemini_flash', 'deepseek'],
    tier: 'fast',
    target: 'opencode.json'
  }
};

const CATEGORY_RECOMMENDATIONS = {
  'visual-engineering': { 
    name: '前端/UI开发', 
    role: '前端、UI/UX、设计',
    prefer: ['gemini_pro', 'sonnet'], 
    tier: 'multimodal'
  },
  'ultrabrain': { 
    name: '复杂逻辑', 
    role: '复杂逻辑任务',
    prefer: ['gpt4', 'opus'], 
    tier: 'reasoning'
  },
  'deep': { 
    name: '深度研究', 
    role: '深度问题研究',
    prefer: ['gpt4', 'opus'], 
    tier: 'reasoning'
  },
  'artistry': { 
    name: '创意设计', 
    role: '创意和非常规方案',
    prefer: ['gemini_pro', 'sonnet'], 
    tier: 'multimodal'
  },
  'quick': { 
    name: '快速任务', 
    role: '简单快速任务',
    prefer: ['haiku', 'gemini_flash'], 
    tier: 'fast'
  },
  'unspecified-low': { 
    name: '通用低复杂度', 
    role: '低复杂度通用任务',
    prefer: ['sonnet', 'gpt4_mini'], 
    tier: 'secondary'
  },
  'unspecified-high': { 
    name: '通用高复杂度', 
    role: '高复杂度通用任务（思维链推理）',
    prefer: ['codex', 'opus', 'o1', 'o3'], 
    tier: 'reasoning'
  },
  'writing': { 
    name: '文档撰写', 
    role: '文档和技术写作',
    prefer: ['gemini_flash', 'sonnet'], 
    tier: 'fast'
  }
};

ipcMain.handle('get-agent-recommendations', async () => {
  return { 
    agents: AGENT_RECOMMENDATIONS, 
    categories: CATEGORY_RECOMMENDATIONS 
  };
});

ipcMain.handle('get-available-models', async () => {
  const configPath = path.join(CONFIG_DIR, 'opencode.json');
  try {
    if (!fs.existsSync(configPath)) {
      return { success: false, error: 'opencode.json not found' };
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const providers = config.provider || {};
    const models = [];
    
    for (const [providerName, providerConfig] of Object.entries(providers)) {
      const providerModels = providerConfig.models || {};
      for (const modelId of Object.keys(providerModels)) {
        models.push({
          id: `${providerName}/${modelId}`,
          name: providerModels[modelId].name || modelId,
          provider: providerName
        });
      }
    }
    
    return { success: true, models };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-agent-models', async (event, agentModels, categoryModels) => {
  const configPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
  try {
    if (!fs.existsSync(configPath)) {
      return { success: false, error: 'oh-my-opencode.json not found' };
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    if (agentModels) {
      if (!config.agents) {
        config.agents = {};
      }
      for (const [agent, model] of Object.entries(agentModels)) {
        if (!config.agents[agent]) {
          config.agents[agent] = {};
        }
        config.agents[agent].model = model;
      }
    }
    
    if (categoryModels) {
      if (!config.categories) {
        config.categories = {};
      }
      for (const [cat, model] of Object.entries(categoryModels)) {
        if (!config.categories[cat]) {
          config.categories[cat] = {};
        }
        config.categories[cat].model = model;
      }
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// compaction is a built-in OpenCode agent — writes to opencode.json, not oh-my-opencode.json
ipcMain.handle('save-compaction-model', async (event, model) => {
  const configPath = path.join(CONFIG_DIR, 'opencode.json');
  try {
    if (!fs.existsSync(configPath)) {
      return { success: false, error: 'opencode.json not found' };
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    if (model) {
      if (!config.agent) config.agent = {};
      config.agent.compaction = {
        model: model
      };
    } else {
      if (config.agent && config.agent.compaction) {
        delete config.agent.compaction;
        if (Object.keys(config.agent).length === 0) {
          delete config.agent;
        }
      }
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-compaction-model', async () => {
  const configPath = path.join(CONFIG_DIR, 'opencode.json');
  try {
    if (!fs.existsSync(configPath)) {
      return { success: true, model: '' };
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const compaction = config.agent?.compaction?.model;
    if (typeof compaction === 'string' && compaction.length > 0) {
      return { success: true, model: compaction };
    }
    // legacy object format migration
    if (compaction && compaction.providerID && compaction.modelID) {
      return { success: true, model: `${compaction.providerID}/${compaction.modelID}` };
    }
    return { success: true, model: '' };
  } catch (error) {
    return { success: false, error: error.message, model: '' };
  }
});

// ============================================
// Webhook Plugin Configuration
// ============================================
const PLUGINS_DIR = path.join(CONFIG_DIR, 'plugins');
const WEBHOOK_PLUGIN_FILE = path.join(PLUGINS_DIR, 'feishu-webhook.js');
const WEBHOOK_CONFIG_FILE = path.join(PLUGINS_DIR, 'feishu-webhook-config.json');

ipcMain.handle('get-webhook-config', async () => {
  try {
    if (fs.existsSync(WEBHOOK_CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(WEBHOOK_CONFIG_FILE, 'utf-8'));
      const scenarios = config.scenarios || [];
      return { 
        success: true, 
        data: { 
          type: 'feishu', 
          url: config.webhook_url,
          enabled: config.enabled !== false,
          notify_permission: scenarios.includes('confirmation'),
          notify_idle: scenarios.includes('completion'),
          notify_error: scenarios.includes('error')
        } 
      };
    }
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-webhook-plugin', async (event, config) => {
  try {
    if (!fs.existsSync(PLUGINS_DIR)) {
      fs.mkdirSync(PLUGINS_DIR, { recursive: true });
    }
    
    // 官方格式插件代码 - 使用 ESM export + event 监听器
    const pluginCode = `// Feishu Webhook Notification Plugin for OpenCode
// Auto-generated by Super OpenCode Config App
// 官方插件格式: https://opencode.ai/docs/plugins

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, "feishu-webhook-config.json");

function loadConfig() {
  try {
    if (existsSync(CONFIG_PATH)) {
      return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    }
  } catch (e) {
    console.error("[feishu-webhook] Failed to load config:", e.message);
  }
  return { enabled: false };
}

async function sendFeishuMessage(webhookUrl, title, content, template = "blue") {
  try {
    const payload = {
      msg_type: "interactive",
      card: {
        header: {
          title: { tag: "plain_text", content: title },
          template: template
        },
        elements: [{
          tag: "markdown",
          content: content
        }]
      }
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.code !== 0 && result.StatusCode !== 0) {
      console.error("[feishu-webhook] Send failed:", result.msg);
    }
  } catch (e) {
    console.error("[feishu-webhook] Error:", e.message);
  }
}

export const FeishuNotificationPlugin = async ({ context }) => {
  const config = loadConfig();
  
  return {
    name: "feishu-webhook",
    
    event: async ({ event }) => {
      if (!config.enabled || !config.webhook_url) return;
      
      const projectName = context?.cwd?.split("/").pop() || "Unknown";
      const scenarios = config.scenarios || ["completion", "error", "confirmation"];
      
      // 会话空闲 = 任务完成
      if (event.type === "session.idle" && scenarios.includes("completion")) {
        await sendFeishuMessage(
          config.webhook_url,
          "✅ OpenCode 任务完成",
          \`**项目**: \${projectName}\\n**时间**: \${new Date().toLocaleString("zh-CN")}\\n\\n任务已完成，等待下一步指令。\`,
          "green"
        );
      }
      
      // 会话错误
      if (event.type === "session.error" && scenarios.includes("error")) {
        await sendFeishuMessage(
          config.webhook_url,
          "❌ OpenCode 运行错误",
          \`**项目**: \${projectName}\\n**时间**: \${new Date().toLocaleString("zh-CN")}\\n**错误**: \${event.error?.message || "发生未知错误"}\`,
          "red"
        );
      }
      
      // 权限请求 = 需要确认
      if (event.type === "permission.request" && scenarios.includes("confirmation")) {
        await sendFeishuMessage(
          config.webhook_url,
          "🔔 OpenCode 需要确认",
          \`**项目**: \${projectName}\\n**时间**: \${new Date().toLocaleString("zh-CN")}\\n**操作**: \${event.permission?.description || "需要您的确认"}\`,
          "yellow"
        );
      }
    }
  };
};

export default FeishuNotificationPlugin;
`;
    
    fs.writeFileSync(WEBHOOK_PLUGIN_FILE, pluginCode);
    
    // 根据前端传递的字段构建 scenarios 数组
    const scenarios = [];
    if (config.notify_permission) scenarios.push('confirmation');
    if (config.notify_idle) scenarios.push('completion');
    if (config.notify_error) scenarios.push('error');
    
    const pluginConfig = {
      enabled: config.enabled !== false,
      webhook_url: config.url,
      scenarios: scenarios.length > 0 ? scenarios : [],
      created_at: new Date().toISOString()
    };
    fs.writeFileSync(WEBHOOK_CONFIG_FILE, JSON.stringify(pluginConfig, null, 2));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('test-webhook', async (event, config) => {
  try {
    const https = require('https');
    const http = require('http');
    
    const payload = JSON.stringify({
      msg_type: 'interactive',
      card: {
        header: {
          title: { tag: 'plain_text', content: '🧪 OpenCode 测试通知' },
          template: 'blue'
        },
        elements: [{
          tag: 'markdown',
          content: '**状态**: 连接成功\\n**时间**: ' + new Date().toLocaleString('zh-CN') + '\\n\\n这是一条来自 Oh-My-OpenCode 配置应用的测试消息。'
        }]
      }
    });
    
    const url = new URL(config.url);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    return new Promise((resolve) => {
      const protocol = url.protocol === 'https:' ? https : http;
      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.code === 0 || result.StatusCode === 0) {
              resolve({ success: true, message: '测试消息发送成功！' });
            } else {
              resolve({ success: false, error: result.msg || '发送失败' });
            }
          } catch (e) {
            resolve({ success: false, error: '响应解析失败: ' + e.message });
          }
        });
      });
      
      req.on('error', (e) => {
        resolve({ success: false, error: '请求失败: ' + e.message });
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        resolve({ success: false, error: '请求超时' });
      });
      
      req.write(payload);
      req.end();
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-skill-config', async (event, skillName) => {
  const configPath = path.join(SKILLS_DIR, skillName, 'config.json');
  try {
    if (fs.existsSync(configPath)) {
      return { success: true, data: JSON.parse(fs.readFileSync(configPath, 'utf-8')) };
    }
    return { success: true, data: {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

const hostedService = require('./lib/hosted-service');
const hostedConfig = require('./lib/hosted-config');

ipcMain.handle('hosted-set-base-url', async (event, url) => {
  hostedService.setBaseUrl(url);
  return { success: true };
});

ipcMain.handle('hosted-login', async (event, username, password) => {
  try {
    const result = await hostedService.login(username, password);
    if (result.success !== false) {
      hostedConfig.saveHostedConfig({ 
        username, 
        lastLogin: new Date().toISOString() 
      });
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-register', async (event, username, password, email, verificationCode, affCode) => {
  try {
    const result = await hostedService.register(username, password, email, verificationCode, affCode);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-logout', async () => {
  try {
    await hostedService.logout();
    hostedConfig.saveHostedConfig({ enabled: false, apiKey: '' });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-get-current-user', async () => {
  try {
    const result = await hostedService.getCurrentUser();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-send-verification-code', async (event, email) => {
  try {
    const result = await hostedService.sendVerificationCode(email);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-get-tokens', async (event, page, pageSize) => {
  try {
    const result = await hostedService.getTokens(page, pageSize);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-create-token', async (event, name, remainQuota, unlimitedQuota, expiredTime) => {
  try {
    const result = await hostedService.createToken(name, remainQuota, unlimitedQuota, expiredTime);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-delete-token', async (event, id) => {
  try {
    const result = await hostedService.deleteToken(id);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-get-available-models', async () => {
  try {
    const result = await hostedService.getAvailableModels();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-get-config', async () => {
  try {
    const config = hostedConfig.getHostedConfig();
    return { success: true, data: config };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-save-config', async (event, config) => {
  try {
    const result = hostedConfig.saveHostedConfig(config);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-apply-config', async (event, apiKey, plan) => {
  try {
    const config = hostedConfig.getHostedConfig();
    config.apiKey = apiKey;
    config.plan = plan || config.plan || 'free';
    config.enabled = true;
    hostedConfig.saveHostedConfig(config);
    
    let remoteConfig = null;
    try {
      const modelsResult = await hostedService.getAvailableModels();
      if (modelsResult && modelsResult.data) {
        const modelList = modelsResult.data.map(m => m.id || m);
        remoteConfig = {
          baseUrl: config.baseUrl,
          models: modelList
        };
      }
    } catch (e) {
      console.error('[hosted-apply-config] Failed to fetch models, using fallback:', e.message);
    }
    
    const opencodeConfigPath = path.join(CONFIG_DIR, 'opencode.json');
    const ohMyConfigPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
    
    let opencodeConfig = {};
    let ohMyOpencodeConfig = {};
    
    if (fs.existsSync(opencodeConfigPath)) {
      opencodeConfig = JSON.parse(fs.readFileSync(opencodeConfigPath, 'utf-8'));
    }
    if (fs.existsSync(ohMyConfigPath)) {
      ohMyOpencodeConfig = JSON.parse(fs.readFileSync(ohMyConfigPath, 'utf-8'));
    }
    
    const result = hostedConfig.applyHostedServiceConfig(opencodeConfig, ohMyOpencodeConfig, config, remoteConfig);
    
    fs.writeFileSync(opencodeConfigPath, JSON.stringify(result.opencodeConfig, null, 2));
    fs.writeFileSync(ohMyConfigPath, JSON.stringify(result.ohMyConfig, null, 2));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-remove-config', async () => {
  try {
    hostedConfig.saveHostedConfig({ enabled: false, apiKey: '' });
    
    const opencodeConfigPath = path.join(CONFIG_DIR, 'opencode.json');
    const ohMyConfigPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
    
    let opencodeConfig = {};
    let ohMyOpencodeConfig = {};
    
    if (fs.existsSync(opencodeConfigPath)) {
      opencodeConfig = JSON.parse(fs.readFileSync(opencodeConfigPath, 'utf-8'));
    }
    if (fs.existsSync(ohMyConfigPath)) {
      ohMyOpencodeConfig = JSON.parse(fs.readFileSync(ohMyConfigPath, 'utf-8'));
    }
    
    const result = hostedConfig.removeHostedServiceConfig(opencodeConfig, ohMyOpencodeConfig);
    
    fs.writeFileSync(opencodeConfigPath, JSON.stringify(result.opencodeConfig, null, 2));
    fs.writeFileSync(ohMyConfigPath, JSON.stringify(result.ohMyConfig, null, 2));
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-get-plan-models', async (event, plan) => {
  try {
    const models = hostedConfig.getModelsForPlan(plan);
    return { success: true, data: models };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-get-usage-logs', async (event, page, pageSize) => {
  try {
    const result = await hostedService.getUsageLogs(page, pageSize);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-redeem-code', async (event, code) => {
  try {
    const result = await hostedService.redeemCode(code);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hosted-get-statistics', async (event, startTime, endTime) => {
  try {
    const result = await hostedService.getStatistics(startTime, endTime);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-skill-config', async (event, skillName, config) => {
  const skillDir = path.join(SKILLS_DIR, skillName);
  try {
    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }
    fs.writeFileSync(path.join(skillDir, 'config.json'), JSON.stringify(config, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// Feishu Bot Configuration & Process Management
// ============================================
let feishuBotProcess = null;

ipcMain.handle('get-feishu-config', async () => {
  try {
    if (fs.existsSync(CREDENTIALS_PATH)) {
      const cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
      const feishuConfig = cred.feishu || {};
      return { 
        success: true, 
        data: {
          app_id: feishuConfig.app_id || '',
          app_secret: feishuConfig.app_secret ? '••••••••' : '',
          working_dir: feishuConfig.working_dir || '',
          server_host: feishuConfig.server_host || '127.0.0.1',
          server_port: feishuConfig.server_port || 4096,
          use_server_mode: feishuConfig.use_server_mode !== false
        }
      };
    }
    return { success: true, data: { app_id: '', app_secret: '', working_dir: '', server_host: '127.0.0.1', server_port: 4096, use_server_mode: true } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-feishu-config', async (event, config) => {
  try {
    let cred = {};
    if (fs.existsSync(CREDENTIALS_PATH)) {
      cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    }
    
    // Preserve existing secret if masked
    const existingSecret = cred.feishu?.app_secret || '';
    
    cred.feishu = {
      app_id: config.app_id || '',
      app_secret: config.app_secret === '••••••••' ? existingSecret : (config.app_secret || ''),
      working_dir: config.working_dir || '',
      server_host: config.server_host || '127.0.0.1',
      server_port: config.server_port || 4096,
      use_server_mode: config.use_server_mode !== false
    };
    
    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(cred, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('start-feishu-bot', async () => {
  try {
    if (feishuBotProcess) {
      return { success: false, error: '飞书机器人已在运行中' };
    }
    
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      return { success: false, error: '请先配置飞书应用凭证' };
    }
    
    const cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const feishuConfig = cred.feishu || {};
    
    if (!feishuConfig.app_id || !feishuConfig.app_secret) {
      return { success: false, error: '请先配置飞书 App ID 和 App Secret' };
    }
    
    const { spawn } = require('child_process');
    
    // feishu_bot 模块路径 - 优先配置目录 > App资源目录 > 开发目录
    const feishuBotPaths = [
      path.join(CONFIG_DIR, 'feishu_bot'),  // ~/.config/opencode/feishu_bot
      path.join(APP_DIR, 'feishu_bot'),     // 打包后 App Resources/feishu_bot
      path.join(os.homedir(), 'Desktop', 'codepro', '阿里云函数管理', 'opencode配置', 'feishu_bot'),  // 开发目录
    ];
    
    let feishuBotDir = null;
    for (const p of feishuBotPaths) {
      if (fs.existsSync(path.join(p, 'main.py'))) {
        feishuBotDir = path.dirname(p);  // 父目录，用于 PYTHONPATH
        break;
      }
    }
    
    if (!feishuBotDir) {
      return { success: false, error: '找不到 feishu_bot 模块。请确保已安装到 ~/.config/opencode/feishu_bot/' };
    }
    
    const args = [
      '-m', 'feishu_bot.main',
      '--app-id', feishuConfig.app_id,
      '--app-secret', feishuConfig.app_secret,
      '--server-host', feishuConfig.server_host || '127.0.0.1',
      '--server-port', String(feishuConfig.server_port || 4096),
      '--server-password', feishuConfig.server_password || 'test123'
    ];
    
    if (feishuConfig.working_dir) {
      args.push('--working-dir', feishuConfig.working_dir);
    }
    
    if (!feishuConfig.use_server_mode) {
      args.push('--no-server');
    }
    
    const pythonPaths = [
      '/Library/Frameworks/Python.framework/Versions/3.13/bin/python3',
      '/Library/Frameworks/Python.framework/Versions/3.12/bin/python3',
      '/opt/homebrew/bin/python3',
      '/usr/local/bin/python3',
      'python3'
    ];
    
    let pythonBin = 'python3';
    for (const p of pythonPaths) {
      if (p === 'python3' || fs.existsSync(p)) {
        pythonBin = p;
        break;
      }
    }
    
    const env = { ...process.env, PYTHONPATH: feishuBotDir };
    
    feishuBotProcess = spawn(pythonBin, args, {
      cwd: feishuBotDir,
      env: env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    feishuBotProcess.stdout.on('data', (data) => {
      console.log('[feishu-bot]', data.toString());
      if (mainWindow) {
        mainWindow.webContents.send('feishu-bot-log', data.toString());
      }
    });
    
    feishuBotProcess.stderr.on('data', (data) => {
      console.error('[feishu-bot]', data.toString());
      if (mainWindow) {
        mainWindow.webContents.send('feishu-bot-log', data.toString());
      }
    });
    
    feishuBotProcess.on('close', (code) => {
      console.log('[feishu-bot] Process exited with code:', code);
      feishuBotProcess = null;
      if (mainWindow) {
        mainWindow.webContents.send('feishu-bot-status', { running: false, code });
      }
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-feishu-bot', async () => {
  try {
    if (!feishuBotProcess) {
      return { success: true };
    }
    
    feishuBotProcess.kill('SIGTERM');
    feishuBotProcess = null;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-feishu-bot-status', async () => {
  return { 
    success: true, 
    data: { 
      running: feishuBotProcess !== null 
    } 
  };
});
