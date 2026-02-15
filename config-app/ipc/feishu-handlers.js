const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { CONFIG_DIR, getFeishuConfig, saveFeishuConfig, getCredentials } = require('../lib/config-service');
const { getMainWindow, getFeishuBotProcess, setFeishuBotProcess, getAppDir } = require('./shared-state');

function register() {
  ipcMain.handle('get-feishu-config', async () => {
    try {
      const result = getFeishuConfig();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting feishu config:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('save-feishu-config', async (event, config) => {
    try {
      saveFeishuConfig(config);
      return { success: true };
    } catch (error) {
      console.error('Error saving feishu config:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('start-feishu-bot', async () => {
    try {
      if (getFeishuBotProcess()) {
        return { success: false, error: '飞书机器人已在运行中' };
      }

      const cred = getCredentials();
      const feishuConfig = cred.feishu || {};

      if (!feishuConfig.app_id || !feishuConfig.app_secret) {
        return { success: false, error: '请先配置飞书 App ID 和 App Secret' };
      }

      const botPaths = [
        path.join(CONFIG_DIR, 'feishu_bot'),
        path.join(getAppDir(), 'feishu_bot')
      ];

      let feishuBotDir = null;
      for (const p of botPaths) {
        if (fs.existsSync(path.join(p, 'main.py'))) {
          feishuBotDir = path.dirname(p);
          break;
        }
      }

      if (!feishuBotDir) {
        return { success: false, error: '找不到 feishu_bot 模块。请确保已安装到 ~/.config/opencode/feishu_bot/' };
      }

      const pythonPaths = [
        '/Library/Frameworks/Python.framework/Versions/3.13/bin/python3',
        '/Library/Frameworks/Python.framework/Versions/3.12/bin/python3',
        '/opt/homebrew/bin/python3',
        '/usr/local/bin/python3',
        'python3'
      ];

      let pythonBin = null;
      for (const pyPath of pythonPaths) {
        if (fs.existsSync(pyPath) || pyPath === 'python3') {
          pythonBin = pyPath;
          break;
        }
      }

      if (!pythonBin) {
        return { success: false, error: 'Python binary not found' };
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

      const proc = spawn(pythonBin, args, {
        cwd: feishuBotDir,
        env: { ...process.env, PYTHONPATH: feishuBotDir },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      setFeishuBotProcess(proc);

      proc.stdout.on('data', (data) => {
        console.log('[feishu-bot]', data.toString());
        const mw = getMainWindow();
        if (mw) {
          mw.webContents.send('feishu-bot-log', data.toString());
        }
      });

      proc.stderr.on('data', (data) => {
        console.error('[feishu-bot]', data.toString());
        const mw = getMainWindow();
        if (mw) {
          mw.webContents.send('feishu-bot-log', data.toString());
        }
      });

      proc.on('close', (code) => {
        setFeishuBotProcess(null);
        const mw = getMainWindow();
        if (mw) {
          mw.webContents.send('feishu-bot-status', { running: false, code });
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error starting feishu bot:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('stop-feishu-bot', async () => {
    try {
      const proc = getFeishuBotProcess();
      if (!proc) {
        return { success: true };
      }

      proc.kill('SIGTERM');
      setFeishuBotProcess(null);
      return { success: true };
    } catch (error) {
      console.error('Error stopping feishu bot:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-feishu-bot-status', async () => {
    try {
      return { success: true, data: { running: getFeishuBotProcess() !== null } };
    } catch (error) {
      console.error('Error getting feishu bot status:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { register };
