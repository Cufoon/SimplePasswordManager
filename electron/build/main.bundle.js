var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/litaes.js
var require_litaes = __commonJS({
  "src/litaes.js"(exports2, module2) {
    "use strict";
    var __create = Object.create;
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps2(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS2 = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var api_exports = {};
    __export2(api_exports, {
      decrypt: () => decrypt2,
      encrypt: () => encrypt2
    });
    module2.exports = __toCommonJS2(api_exports);
    var import_node_crypto2 = require("node:crypto");
    var import_node_zlib = require("node:zlib");
    var import_node_stream = require("node:stream");
    var PrependInitVectTransform = class extends import_node_stream.Transform {
      initVect;
      notPrepended;
      constructor(initVect, opts) {
        super(opts);
        this.initVect = initVect;
        this.notPrepended = true;
      }
      _transform(chunk, encoding, callback) {
        if (this.notPrepended) {
          this.push(this.initVect);
          this.notPrepended = false;
        }
        this.push(chunk);
        callback();
      }
    };
    var ProgressTransform = class extends import_node_stream.Transform {
      processedChunksN = 0;
      totalChunksN = 0;
      updateProcess(percent) {
        console.log("current progress:", percent, "%");
      }
      constructor({ total, updateProcess }, options) {
        super(options);
        this.totalChunksN = total;
        this.processedChunksN = 0;
        if (updateProcess) {
          this.updateProcess = updateProcess;
        }
      }
      _transform(chunk, encoding, callback) {
        this.processedChunksN++;
        const cp = this.processedChunksN * 100 / this.totalChunksN;
        this.updateProcess(cp);
        this.push(chunk);
        callback();
      }
    };
    var import_node_crypto = __toESM(require("node:crypto"), 1);
    var import_node_stream2 = require("node:stream");
    var getCipherKey = (password) => {
      return import_node_crypto.default.createHash("sha256").update(password).digest();
    };
    var createReadableStream = (content) => {
      return import_node_stream2.Readable.from(content);
    };
    var createWritableStream = (callback) => {
      let buffers = [];
      const writer = new import_node_stream2.Writable({
        write(chunk, encoding, cb) {
          buffers.push(chunk);
          cb();
        }
      });
      writer.on("finish", () => {
        const combinedBuffer = Buffer.concat(buffers);
        callback(combinedBuffer);
      });
      return writer;
    };
    var encrypt = async ({ content, password, onProgress, compress = false }) => {
      const initVectOrigin = (0, import_node_crypto2.randomBytes)(16);
      const headerStr = `lit${compress ? "c" : "a"}`;
      const header = headerStr.split("").map((item) => item.charCodeAt(0));
      initVectOrigin.forEach((item) => {
        header.push(item);
      });
      const initVect = Buffer.from(header);
      const cipherKey = getCipherKey(password);
      const chunksN = content.length;
      const readStream = createReadableStream(content);
      const brotli = (0, import_node_zlib.createBrotliCompress)({
        params: {
          [import_node_zlib.constants.BROTLI_PARAM_QUALITY]: 3
        }
      });
      const cipher = (0, import_node_crypto2.createCipheriv)("aes-256-cbc", cipherKey, initVectOrigin);
      const prependInitVect = new PrependInitVectTransform(initVect);
      return await new Promise((resolve, reject) => {
        const throwError = (e) => {
          reject(e);
        };
        const writeStream = createWritableStream((buffer) => resolve(buffer));
        let pipes = readStream.on("error", throwError);
        if (onProgress) {
          const progress = new ProgressTransform({
            total: chunksN,
            updateProcess: (percent) => {
              onProgress(percent, chunksN);
            }
          });
          pipes = pipes.pipe(progress).on("error", throwError);
        }
        if (compress) {
          pipes = pipes.pipe(brotli).on("error", throwError);
        }
        pipes.pipe(cipher).on("error", throwError).pipe(prependInitVect).on("error", throwError).pipe(writeStream).on("error", throwError);
      });
    };
    var encrypt_api_default = encrypt;
    var import_node_crypto3 = require("node:crypto");
    var import_node_zlib2 = require("node:zlib");
    var getInitVect = (content) => content.subarray(0, 20);
    var decrypt = async ({ content, password, onProgress }) => {
      const chunksN = Math.ceil(content.length / (64 * 1024));
      const initVect = getInitVect(content);
      const len = initVect.length;
      if (len !== 20) {
        throw new Error("Invalid init vector");
      }
      const isCompressed = initVect[3] === "c".charCodeAt(0);
      const initVectOrigin = initVect.subarray(4);
      const cipherKey = getCipherKey(password);
      const decipher = (0, import_node_crypto3.createDecipheriv)("aes-256-cbc", cipherKey, initVectOrigin);
      const brotli = (0, import_node_zlib2.createBrotliDecompress)();
      const readStream = createReadableStream(content.subarray(20));
      return await new Promise((resolve, reject) => {
        const throwError = (e) => {
          reject(e);
        };
        const writeStream = createWritableStream((buffer) => resolve(buffer));
        let pipes = readStream.on("error", throwError);
        if (onProgress) {
          const progress = new ProgressTransform({
            total: chunksN,
            updateProcess: (percent) => {
              onProgress(percent, chunksN);
            }
          });
          pipes = pipes.pipe(progress).on("error", throwError);
        }
        pipes = pipes.pipe(decipher).on("error", throwError);
        if (isCompressed) {
          pipes = pipes.pipe(brotli).on("error", throwError);
        }
        pipes.pipe(writeStream).on("error", throwError);
      });
    };
    var decrypt_api_default = decrypt;
    var encrypt2 = async (options) => await encrypt_api_default(options);
    var decrypt2 = async (options) => await decrypt_api_default(options);
  }
});

// src/file.js
var file_exports = {};
__export(file_exports, {
  readFile: () => readFile,
  requestOpenAFile: () => requestOpenAFile,
  writeFile: () => writeFile
});
var fs, dialog, litaes, requestOpenAFile, readFile, writeFile;
var init_file = __esm({
  "src/file.js"() {
    fs = require("node:fs");
    ({ dialog } = require("electron"));
    litaes = require_litaes();
    requestOpenAFile = async (browserWindow) => {
      const { filePaths } = await dialog.showOpenDialog(browserWindow, {
        properties: [
          "openFile",
          "showHiddenFiles",
          "promptToCreate",
          "createDirectory",
          "dontAddToRecent"
        ],
        filters: [
          { name: "Simple Password Manager Storage File", extensions: ["litpw"] }
        ]
      });
      return filePaths[0];
    };
    readFile = async (event, filePath, password) => {
      const content = fs.readFileSync(filePath);
      const decrypted = await litaes.decrypt({
        content,
        password
      });
      return decrypted.toString();
    };
    writeFile = async (event, filePath, password, content) => {
      const encrypted = await litaes.encrypt({
        content: Buffer.from(content),
        password
      });
      try {
        fs.writeFileSync(filePath, encrypted);
        return true;
      } catch (e) {
        return false;
      }
    };
  }
});

// src/main.js
var path = require("node:path");
var { app, BrowserWindow, ipcMain } = require("electron");
var { requestOpenAFile: requestOpenAFile2, readFile: readFile2, writeFile: writeFile2 } = (init_file(), __toCommonJS(file_exports));
var Store = require("electron-store");
var store = new Store();
var messageHandler = (browserWindow) => {
  ipcMain.handle("openFile", () => requestOpenAFile2(browserWindow));
  ipcMain.handle("readFile", readFile2);
  ipcMain.handle("writeFile", writeFile2);
  ipcMain.handle("setEK", (event, ek) => store.set("ek", ek));
  ipcMain.handle("getEK", () => store.get("ek"));
  ipcMain.handle("clearEK", () => store.delete("ek"));
};
var createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.bundle.js")
    }
  });
  mainWindow.loadURL("http://localhost:5173/");
  return mainWindow;
};
(async () => {
  app.whenReady().then(() => {
    const mainWindow = createWindow();
    messageHandler(mainWindow);
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0)
        createWindow();
    });
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
      app.quit();
  });
})();
