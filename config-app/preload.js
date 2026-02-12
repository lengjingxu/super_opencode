const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('configAPI', {
  readConfig: (filename) => ipcRenderer.invoke('read-config', filename),
  writeConfig: (filename, data) => ipcRenderer.invoke('write-config', filename, data),
  readAgentsMd: () => ipcRenderer.invoke('read-agents-md'),
  writeAgentsMd: (content) => ipcRenderer.invoke('write-agents-md', content),
  getConfigDir: () => ipcRenderer.invoke('get-config-dir'),
  
  checkInstallStatus: () => ipcRenderer.invoke('check-install-status'),
  installOpencode: () => ipcRenderer.invoke('install-opencode'),
  installOhMyOpencode: () => ipcRenderer.invoke('install-oh-my-opencode'),
  installPlugins: () => ipcRenderer.invoke('install-plugins'),
  installUiuxSkill: () => ipcRenderer.invoke('install-uiux-skill'),
  setupConfig: (options) => ipcRenderer.invoke('setup-config', options),
  openConfigDir: () => ipcRenderer.invoke('open-config-dir'),
  
  launchOpencode: (mode) => ipcRenderer.invoke('launch-opencode', mode),
  openWebUI: () => ipcRenderer.invoke('open-web-ui'),
  getOpencodeConfig: () => ipcRenderer.invoke('get-opencode-config'),
  saveOpencodeConfig: (config) => ipcRenderer.invoke('save-opencode-config', config),
  
  getDesignStyles: () => ipcRenderer.invoke('get-design-styles')
});

contextBridge.exposeInMainWorld('api', {
  checkInitStatus: () => ipcRenderer.invoke('check-install-status'),
  checkOpenCodeInstalled: async () => {
    const status = await ipcRenderer.invoke('check-install-status');
    return { installed: status.opencode };
  },
  openExternal: (url) => require('electron').shell.openExternal(url),
  
  loadConfig: () => ipcRenderer.invoke('read-config', 'app-config.json'),
  saveConfig: (config) => ipcRenderer.invoke('write-config', 'app-config.json', config),
  
  loadCredentials: () => ipcRenderer.invoke('read-config-app-file', 'credentials.json'),
  saveCredentials: (credentials) => ipcRenderer.invoke('write-config-app-file', 'credentials.json', credentials),
  
  setupConfig: (options) => ipcRenderer.invoke('setup-config', options),

  installOpencode: () => ipcRenderer.invoke('install-opencode'),
  installOhMyOpencode: () => ipcRenderer.invoke('install-oh-my-opencode'),
  installPlugins: () => ipcRenderer.invoke('install-plugins'),
  installUiuxSkill: () => ipcRenderer.invoke('install-uiux-skill'),
  launchOpencode: (mode) => ipcRenderer.invoke('launch-opencode', mode),
  openWebUI: () => ipcRenderer.invoke('open-web-ui'),
  openConfigDir: () => ipcRenderer.invoke('open-config-dir'),
  readAgentsMd: () => ipcRenderer.invoke('read-agents-md'),
  writeAgentsMd: (content) => ipcRenderer.invoke('write-agents-md', content),
  getOpencodeConfig: () => ipcRenderer.invoke('get-opencode-config'),
  getOhMyOpencodeConfig: () => ipcRenderer.invoke('get-oh-my-opencode-config'),
  saveOpencodeConfig: (config) => ipcRenderer.invoke('save-opencode-config', config),
  
  loadAllConfigs: () => ipcRenderer.invoke('load-all-configs'),
  saveConfigWithBackup: (configType, data) => ipcRenderer.invoke('save-config-with-backup', configType, data),
  listBackups: (configType) => ipcRenderer.invoke('list-backups', configType),
  restoreBackup: (backupName) => ipcRenderer.invoke('restore-backup', backupName),
  
  checkSkillInstalled: (skillName) => ipcRenderer.invoke('check-skill-installed', skillName),
  installImageGeneratorSkill: (serviceUrl, apiKey) => ipcRenderer.invoke('install-image-generator-skill', serviceUrl, apiKey),
  
  getFcConfig: () => ipcRenderer.invoke('get-fc-config'),
  saveFcConfig: (config) => ipcRenderer.invoke('save-fc-config', config),
  getSqlConfig: () => ipcRenderer.invoke('get-sql-config'),
  saveSqlConfig: (config) => ipcRenderer.invoke('save-sql-config', config),
  
  getAgentRecommendations: () => ipcRenderer.invoke('get-agent-recommendations'),
  getAvailableModels: () => ipcRenderer.invoke('get-available-models'),
  saveAgentModels: (agentModels, categoryModels) => ipcRenderer.invoke('save-agent-models', agentModels, categoryModels),
  saveCompactionModel: (model) => ipcRenderer.invoke('save-compaction-model', model),
  getCompactionModel: () => ipcRenderer.invoke('get-compaction-model'),
  
  getWebhookConfig: () => ipcRenderer.invoke('get-webhook-config'),
  saveWebhookPlugin: (config) => ipcRenderer.invoke('save-webhook-plugin', config),
  testWebhook: (config) => ipcRenderer.invoke('test-webhook', config),
  
  readSkillConfig: (skillName) => ipcRenderer.invoke('read-skill-config', skillName),
  writeSkillConfig: (skillName, config) => ipcRenderer.invoke('write-skill-config', skillName, config),
  getConfigDir: () => ipcRenderer.invoke('get-config-dir'),
  installSkills: () => ipcRenderer.invoke('install-skills'),
  
  hostedSetBaseUrl: (url) => ipcRenderer.invoke('hosted-set-base-url', url),
  hostedLogin: (username, password) => ipcRenderer.invoke('hosted-login', username, password),
  hostedRegister: (username, password, email, verificationCode, affCode) => 
    ipcRenderer.invoke('hosted-register', username, password, email, verificationCode, affCode),
  hostedLogout: () => ipcRenderer.invoke('hosted-logout'),
  hostedGetCurrentUser: () => ipcRenderer.invoke('hosted-get-current-user'),
  hostedSendVerificationCode: (email) => ipcRenderer.invoke('hosted-send-verification-code', email),
  hostedGetTokens: (page, pageSize) => ipcRenderer.invoke('hosted-get-tokens', page, pageSize),
  hostedCreateToken: (name, remainQuota, unlimitedQuota, expiredTime) => 
    ipcRenderer.invoke('hosted-create-token', name, remainQuota, unlimitedQuota, expiredTime),
  hostedDeleteToken: (id) => ipcRenderer.invoke('hosted-delete-token', id),
  hostedGetAvailableModels: () => ipcRenderer.invoke('hosted-get-available-models'),
  hostedGetConfig: () => ipcRenderer.invoke('hosted-get-config'),
  hostedSaveConfig: (config) => ipcRenderer.invoke('hosted-save-config', config),
  hostedApplyConfig: (apiKey, plan) => ipcRenderer.invoke('hosted-apply-config', apiKey, plan),
  hostedRemoveConfig: () => ipcRenderer.invoke('hosted-remove-config'),
  hostedGetPlanModels: (plan) => ipcRenderer.invoke('hosted-get-plan-models', plan),
  hostedGetUsageLogs: (page, pageSize) => ipcRenderer.invoke('hosted-get-usage-logs', page, pageSize),
  hostedRedeemCode: (code) => ipcRenderer.invoke('hosted-redeem-code', code),
  hostedGetStatistics: (startTime, endTime) => ipcRenderer.invoke('hosted-get-statistics', startTime, endTime),
  
  // Feishu Bot
  getFeishuConfig: () => ipcRenderer.invoke('get-feishu-config'),
  saveFeishuConfig: (config) => ipcRenderer.invoke('save-feishu-config', config),
  startFeishuBot: () => ipcRenderer.invoke('start-feishu-bot'),
  stopFeishuBot: () => ipcRenderer.invoke('stop-feishu-bot'),
  getFeishuBotStatus: () => ipcRenderer.invoke('get-feishu-bot-status'),
  onFeishuBotLog: (callback) => ipcRenderer.on('feishu-bot-log', (_, log) => callback(log)),
  onFeishuBotStatus: (callback) => ipcRenderer.on('feishu-bot-status', (_, status) => callback(status)),
  
  openClientWindow: () => ipcRenderer.invoke('open-client-window')
});

contextBridge.exposeInMainWorld('updater', {
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  downloadUpdate: () => ipcRenderer.invoke('updater:download'),
  installUpdate: () => ipcRenderer.invoke('updater:install'),
  getStatus: () => ipcRenderer.invoke('updater:status'),
  getVersion: () => ipcRenderer.invoke('updater:version'),
  
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (_, info) => callback(info));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (_, info) => callback(info));
  },
  onUpdateNotAvailable: (callback) => {
    ipcRenderer.on('update-not-available', () => callback());
  },
  onUpdaterStatus: (callback) => {
    ipcRenderer.on('updater-status', (_, status) => callback(status));
  }
});
