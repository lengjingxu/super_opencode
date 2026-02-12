const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronPlatform', {
  openDirectoryPickerDialog: () => ipcRenderer.invoke('client-open-directory'),
  openFilePickerDialog: (options) => ipcRenderer.invoke('client-open-file', options),
  
  getServerStatus: () => ipcRenderer.invoke('opencode-server-status'),
  startServer: (cwd, port) => ipcRenderer.invoke('opencode-server-start', cwd, port),
  stopServer: () => ipcRenderer.invoke('opencode-server-stop'),
  getPassword: () => ipcRenderer.invoke('client-get-password'),
  
  onServerLog: (callback) => {
    ipcRenderer.on('opencode-server-log', (_, data) => callback(data));
  },
  onServerStatusChange: (callback) => {
    ipcRenderer.on('opencode-server-status', (_, status) => callback(status));
  },
  onEvent: (callback) => {
    ipcRenderer.on('opencode-event', (_, event) => callback(event));
  },
  
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  
  removeServerLogListener: (callback) => {
    ipcRenderer.removeListener('opencode-server-log', callback);
  },
  removeServerStatusListener: (callback) => {
    ipcRenderer.removeListener('opencode-server-status', callback);
  },
  removeEventListener: (callback) => {
    ipcRenderer.removeListener('opencode-event', callback);
  }
});
