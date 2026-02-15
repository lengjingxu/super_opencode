const { ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const {
  CONFIG_DIR, CONFIG_APP_DIR, AUTH_DIR, SKILLS_DIR,
  ensureDir, readJsonFile, writeJsonFile,
  listBackups
} = require('../lib/config-service');
const { getAppDir } = require('./shared-state');

function register() {
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
    try {
      ensureDir(CONFIG_DIR);
      writeJsonFile(path.join(CONFIG_DIR, filename), data);
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
    try {
      ensureDir(CONFIG_APP_DIR);
      writeJsonFile(path.join(CONFIG_APP_DIR, filename), data);
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

  ipcMain.handle('get-config-dir', async () => CONFIG_DIR);

  ipcMain.handle('load-all-configs', async () => {
    try {
      const configs = { opencode: null, ohMyOpencode: null, auth: null };
      configs.opencode = readJsonFile(path.join(CONFIG_DIR, 'opencode.json'));
      configs.ohMyOpencode = readJsonFile(path.join(CONFIG_DIR, 'oh-my-opencode.json'));
      configs.auth = readJsonFile(path.join(AUTH_DIR, 'auth.json'));
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
      ensureDir(backupDir);

      if (fs.existsSync(filePath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `${configType}-${timestamp}.json`;
        fs.copyFileSync(filePath, path.join(backupDir, backupName));

        const backups = fs.readdirSync(backupDir)
          .filter(f => f.startsWith(configType + '-'))
          .sort().reverse();
        if (backups.length > 10) {
          backups.slice(10).forEach(f => fs.unlinkSync(path.join(backupDir, f)));
        }
      }

      ensureDir(path.dirname(filePath));
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
      let targetPath;
      if (backupName.startsWith('oh-my-opencode-')) {
        targetPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
      } else if (backupName.startsWith('opencode-')) {
        targetPath = path.join(CONFIG_DIR, 'opencode.json');
      } else if (backupName.startsWith('auth-')) {
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

  ipcMain.handle('get-oh-my-opencode-template', async () => {
    const templatePath = path.join(getAppDir(), 'templates', 'oh-my-opencode.json');
    try {
      if (fs.existsSync(templatePath)) {
        return { success: true, data: JSON.parse(fs.readFileSync(templatePath, 'utf-8')) };
      }
      return { success: false, error: 'Template not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('open-config-dir', async () => {
    shell.openPath(CONFIG_DIR);
  });

  ipcMain.handle('open-external', async (event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle('get-design-styles', async () => {
    const stylesPath = path.join(getAppDir(), 'templates', 'design-styles.json');
    try {
      if (fs.existsSync(stylesPath)) {
        return { success: true, data: JSON.parse(fs.readFileSync(stylesPath, 'utf-8')) };
      }
      return { success: false, error: 'Design styles not found' };
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

  ipcMain.handle('write-skill-config', async (event, skillName, config) => {
    const skillDir = path.join(SKILLS_DIR, skillName);
    try {
      ensureDir(skillDir);
      fs.writeFileSync(path.join(skillDir, 'config.json'), JSON.stringify(config, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

module.exports = { register };
