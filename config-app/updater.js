/**
 * 自动更新模块
 * 基于 GitHub Releases 实现应用热更新
 */

const { autoUpdater } = require('electron-updater');
const { app, dialog, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// 更新状态
let updateStatus = {
  checking: false,
  available: false,
  downloaded: false,
  downloading: false,
  progress: 0,
  version: null,
  error: null
};

// 主窗口引用
let mainWindow = null;

/**
 * 初始化自动更新
 * @param {BrowserWindow} win - 主窗口实例
 */
function initAutoUpdater(win) {
  mainWindow = win;
  
  // 配置 autoUpdater
  autoUpdater.autoDownload = false; // 不自动下载，让用户确认
  autoUpdater.autoInstallOnAppQuit = true; // 退出时自动安装
  autoUpdater.allowDowngrade = false; // 不允许降级
  
  // 开发环境下也检查更新（用于测试）
  if (process.env.NODE_ENV === 'development' || app.isPackaged === false) {
    autoUpdater.forceDevUpdateConfig = true;
    // 开发环境使用本地 dev-app-update.yml 配置
    autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
  }

  // 设置日志
  autoUpdater.logger = require('electron').app.isPackaged ? null : console;

  // 注册事件监听
  setupAutoUpdaterEvents();
  
  // 注册 IPC 处理
  setupIPCHandlers();
  
  // 应用启动后延迟检查更新（避免影响启动速度）
  setTimeout(() => {
    checkForUpdates(true); // 静默检查
  }, 3000);
}

/**
 * 设置 autoUpdater 事件监听
 */
function setupAutoUpdaterEvents() {
  // 检查更新时
  autoUpdater.on('checking-for-update', () => {
    updateStatus = { ...updateStatus, checking: true, error: null };
    sendStatusToWindow('checking-for-update');
    console.log('[Updater] 正在检查更新...');
  });

  // 有可用更新
  autoUpdater.on('update-available', (info) => {
    updateStatus = {
      ...updateStatus,
      checking: false,
      available: true,
      version: info.version
    };
    sendStatusToWindow('update-available', info);
    console.log(`[Updater] 发现新版本: ${info.version}`);
    
    // 通知渲染进程显示更新提示
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseNotes: info.releaseNotes,
        releaseDate: info.releaseDate
      });
    }
  });

  // 没有可用更新
  autoUpdater.on('update-not-available', (info) => {
    updateStatus = { ...updateStatus, checking: false, available: false };
    sendStatusToWindow('update-not-available', info);
    console.log('[Updater] 当前已是最新版本');
  });

  // 下载进度
  autoUpdater.on('download-progress', (progressObj) => {
    updateStatus = {
      ...updateStatus,
      downloading: true,
      progress: progressObj.percent
    };
    sendStatusToWindow('download-progress', progressObj);
    console.log(`[Updater] 下载进度: ${progressObj.percent.toFixed(1)}%`);
  });

  // 下载完成
  autoUpdater.on('update-downloaded', (info) => {
    updateStatus = {
      ...updateStatus,
      downloading: false,
      downloaded: true,
      progress: 100
    };
    sendStatusToWindow('update-downloaded', info);
    console.log('[Updater] 更新下载完成，准备安装');
    
    // 通知渲染进程
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-downloaded', {
        version: info.version
      });
    }
  });

  // 更新错误
  autoUpdater.on('error', (err) => {
    updateStatus = {
      ...updateStatus,
      checking: false,
      downloading: false,
      error: err.message
    };
    sendStatusToWindow('update-error', { message: err.message });
    console.error('[Updater] 更新错误:', err.message);
  });
}

/**
 * 设置 IPC 处理器
 */
function setupIPCHandlers() {
  // 检查更新
  ipcMain.handle('updater:check', async () => {
    return await checkForUpdates(false);
  });

  // 下载更新
  ipcMain.handle('updater:download', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // 安装更新（重启应用）
  ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall(false, true);
  });

  // 获取当前状态
  ipcMain.handle('updater:status', () => {
    return {
      ...updateStatus,
      currentVersion: app.getVersion()
    };
  });

  // 获取当前版本
  ipcMain.handle('updater:version', () => {
    return app.getVersion();
  });
}

/**
 * 检查更新
 * @param {boolean} silent - 是否静默检查（不显示"已是最新"提示）
 */
async function checkForUpdates(silent = false) {
  try {
    const result = await autoUpdater.checkForUpdates();
    
    if (!silent && !result?.updateInfo) {
      // 非静默模式下，如果没有更新，可以通知用户
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-not-available');
      }
    }
    
    return {
      success: true,
      updateAvailable: updateStatus.available,
      version: result?.updateInfo?.version
    };
  } catch (error) {
    console.error('[Updater] 检查更新失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 发送状态到渲染窗口
 */
function sendStatusToWindow(event, data = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater-status', { event, data });
  }
}

/**
 * 手动触发下载
 */
async function downloadUpdate() {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 安装更新并重启
 */
function installUpdate() {
  autoUpdater.quitAndInstall(false, true);
}

module.exports = {
  initAutoUpdater,
  checkForUpdates,
  downloadUpdate,
  installUpdate,
  getUpdateStatus: () => updateStatus
};
