const path = require('node:path');
const { app, BrowserWindow, ipcMain } = require('electron');
const { requestOpenAFile, readFile, writeFile } = require('./file');
const Store = require('electron-store');

const store = new Store();

const messageHandler = (browserWindow) => {
  ipcMain.handle('openFile', () => requestOpenAFile(browserWindow));
  ipcMain.handle('readFile', readFile);
  ipcMain.handle('writeFile', writeFile);
  ipcMain.handle('setEK', (event, ek) => store.set('ek', ek));
  ipcMain.handle('getEK', () => store.get('ek'));
  ipcMain.handle('clearEK', () => store.delete('ek'));
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.bundle.js')
    }
  });

  // mainWindow.loadFile('./content/index.html');
  mainWindow.loadURL('http://localhost:5173/');

  // 打开开发工具
  // mainWindow.webContents.openDevTools();
  return mainWindow;
};

(async () => {
  // await loader.load();
  app.whenReady().then(() => {
    const mainWindow = createWindow();
    messageHandler(mainWindow);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
})();
