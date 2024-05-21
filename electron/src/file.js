const fs = require('node:fs');
const { dialog } = require('electron');
const litaes = require('./litaes');

export const requestOpenAFile = async (browserWindow) => {
  const { filePaths } = await dialog.showOpenDialog(browserWindow, {
    properties: [
      'openFile',
      'showHiddenFiles',
      'promptToCreate',
      'createDirectory',
      'dontAddToRecent'
    ],
    filters: [
      { name: 'Simple Password Manager Storage File', extensions: ['litpw'] }
    ]
  });
  return filePaths[0];
};

export const readFile = async (event, filePath, password) => {
  const content = fs.readFileSync(filePath);
  const decrypted = await litaes.decrypt({
    content: content,
    password: password
  });
  return decrypted.toString();
};

export const writeFile = async (event, filePath, password, content) => {
  const encrypted = await litaes.encrypt({
    content: Buffer.from(content),
    password: password
  });
  try {
    fs.writeFileSync(filePath, encrypted);
    return true;
  } catch (e) {
    return false;
  }
};
