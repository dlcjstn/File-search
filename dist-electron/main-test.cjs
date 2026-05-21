"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/electron/main.ts
var import_electron = require("electron");
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));
var import_child_process = require("child_process");
var import_util = require("util");
var execAsync = (0, import_util.promisify)(import_child_process.exec);
var MAX_RESULTS = 1e4;
var REQUEST_TIMEOUT = 6e4;
var mainWindow = null;
function createWindow() {
  mainWindow = new import_electron.BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
  }
  mainWindow.webContents.openDevTools();
  if (process.env.NODE_ENV !== "development") {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}
import_electron.app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();
});
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron.app.quit();
  }
});
import_electron.app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
async function isSystemFile(filePath) {
  if (process.platform !== "win32") {
    return false;
  }
  try {
    const { stdout } = await execAsync(`attrib "${filePath}"`, { timeout: 1e3 });
    if (stdout && stdout.length >= 3) {
      const attributes = stdout.substring(0, 3).toUpperCase();
      return attributes.includes("S");
    }
    return false;
  } catch (error) {
    return false;
  }
}
async function searchFiles(options) {
  const results = [];
  const searchPaths = options.searchPath ? [options.searchPath] : ["C:\\", "D:\\"];
  let searchedDirs = 0;
  let searchedFiles = 0;
  let errors = 0;
  let lastProgressUpdate = Date.now();
  const startTime = Date.now();
  const searchDirectory = async (dirPath, depth = 0) => {
    if (Date.now() - startTime > REQUEST_TIMEOUT) {
      console.log("\u641C\u7D22\u8D85\u65F6\uFF0C\u505C\u6B62\u641C\u7D22");
      return;
    }
    if (depth > 8 || results.length >= MAX_RESULTS) return;
    if (searchedDirs > 5e4) return;
    searchedDirs++;
    if (Date.now() - lastProgressUpdate > 3e3) {
      lastProgressUpdate = Date.now();
      console.log(`\u8FDB\u5EA6: \u5DF2\u626B\u63CF ${searchedDirs} \u4E2A\u76EE\u5F55, ${searchedFiles} \u4E2A\u6587\u4EF6, \u627E\u5230 ${results.length} \u4E2A\u5339\u914D...`);
    }
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (results.length >= MAX_RESULTS) break;
        if (Date.now() - startTime > REQUEST_TIMEOUT) break;
        const fullPath = path.join(dirPath, entry.name);
        try {
          const stats = await fs.promises.stat(fullPath);
          if (stats.isFile()) {
            searchedFiles++;
            const parsed = path.parse(entry.name);
            let shouldInclude = true;
            if (options.keyword) {
              const keywordLower = options.keyword.toLowerCase();
              const nameLower = entry.name.toLowerCase();
              if (nameLower.includes(keywordLower)) {
                shouldInclude = true;
              } else {
                shouldInclude = false;
              }
            }
            if (shouldInclude && options.extensions.length > 0) {
              shouldInclude = options.extensions.includes(parsed.ext.toLowerCase());
            }
            if (shouldInclude) {
              const systemFile = await isSystemFile(fullPath);
              results.push({
                name: entry.name,
                path: fullPath,
                size: stats.size,
                modifiedDate: stats.mtime.toISOString(),
                extension: parsed.ext,
                type: "file",
                isSystem: systemFile
              });
            }
          } else if (stats.isDirectory() && !entry.name.startsWith(".")) {
            await searchDirectory(fullPath, depth + 1);
          }
        } catch (err) {
          errors++;
        }
      }
    } catch (err) {
      errors++;
    }
  };
  for (const searchPath of searchPaths) {
    try {
      await fs.promises.access(searchPath);
      await searchDirectory(searchPath);
      if (results.length > 0) {
        console.log(`\u5728 ${searchPath} \u4E2D\u627E\u5230 ${results.length} \u4E2A\u6587\u4EF6\uFF0C\u505C\u6B62\u641C\u7D22`);
        break;
      }
    } catch (err) {
      console.log(`\u8DEF\u5F84 ${searchPath} \u4E0D\u53EF\u8BBF\u95EE\u6216\u4E0D\u5B58\u5728`);
    }
  }
  console.log("\u641C\u7D22\u5B8C\u6210\u7EDF\u8BA1:", {
    searchedDirs,
    searchedFiles,
    foundFiles: results.length,
    errors,
    time: `${Date.now() - startTime}ms`
  });
  return results;
}
function buildFileTree(files, rootPath) {
  const tree = [];
  const pathMap = /* @__PURE__ */ new Map();
  const normalizedRootPath = rootPath.replace(/\//g, "\\");
  files.sort((a, b) => a.path.localeCompare(b.path));
  for (const file of files) {
    const normalizedFilePath = file.path.replace(/\//g, "\\");
    const relativePath = normalizedFilePath.replace(normalizedRootPath, "").replace(/^[\\\/]+/, "");
    const parts = relativePath.split(/[\\\/]/).filter(Boolean);
    let currentPath = normalizedRootPath;
    let parentChildren = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = path.join(currentPath, parts[i]);
      if (!pathMap.has(currentPath)) {
        const folderNode = {
          name: parts[i],
          path: currentPath,
          size: 0,
          modifiedDate: "",
          extension: "",
          type: "folder",
          children: []
        };
        pathMap.set(currentPath, folderNode);
        parentChildren.push(folderNode);
      }
      const parentNode = pathMap.get(currentPath);
      parentChildren = parentNode.children;
    }
    parentChildren.push(file);
  }
  return tree;
}
function setupIpcHandlers() {
  import_electron.ipcMain.handle("search-files", async (_event, options) => {
    console.log("\u6536\u5230\u641C\u7D22\u8BF7\u6C42:", options);
    const files = await searchFiles(options);
    const tree = buildFileTree(files, options.searchPath || "D:\\");
    return tree;
  });
  import_electron.ipcMain.handle("open-file", async (_event, filePath) => {
    try {
      const isWindows = process.platform === "win32";
      let command;
      if (isWindows) {
        command = `start "" "${filePath}"`;
      } else if (process.platform === "darwin") {
        command = `open "${filePath}"`;
      } else {
        command = `xdg-open "${filePath}"`;
      }
      (0, import_child_process.exec)(command, (error) => {
        if (error) {
          console.error("\u6253\u5F00\u6587\u4EF6\u5931\u8D25:", error);
        } else {
          console.log("\u6587\u4EF6\u5DF2\u6253\u5F00:", filePath);
        }
      });
    } catch (error) {
      console.error("\u6253\u5F00\u6587\u4EF6\u5F02\u5E38:", error);
      throw error;
    }
  });
  import_electron.ipcMain.handle("open-folder", async (_event, folderPath) => {
    try {
      const isWindows = process.platform === "win32";
      let command;
      if (isWindows) {
        command = `start "" "${folderPath}"`;
      } else if (process.platform === "darwin") {
        command = `open "${folderPath}"`;
      } else {
        command = `xdg-open "${folderPath}"`;
      }
      (0, import_child_process.exec)(command, { shell: "/bin/bash" }, (error) => {
        if (error && !isWindows) {
          console.error("\u6253\u5F00\u6587\u4EF6\u5939\u5931\u8D25:", error);
        } else {
          console.log("\u6587\u4EF6\u5939\u5DF2\u6253\u5F00:", folderPath);
        }
      });
    } catch (error) {
      console.error("\u6253\u5F00\u6587\u4EF6\u5939\u5F02\u5E38:", error);
      throw error;
    }
  });
  import_electron.ipcMain.handle("open-path", async (_event, targetPath) => {
    try {
      await import_electron.shell.showItemInFolder(targetPath);
    } catch (error) {
      console.error("\u6253\u5F00\u8DEF\u5F84\u5931\u8D25:", error);
      throw error;
    }
  });
}
