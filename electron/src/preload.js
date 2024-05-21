const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('openFile'),
  readFile: (filePath, password) =>
    ipcRenderer.invoke('readFile', filePath, password),
  writeFile: (filePath, password, content) =>
    ipcRenderer.invoke('writeFile', filePath, password, content),
  getEK: () => ipcRenderer.invoke('getEK'),
  setEK: (ek) => ipcRenderer.invoke('setEK', ek),
  clearEK: () => ipcRenderer.invoke('clearEK')
});
