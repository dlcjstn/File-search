"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/electron/preload.ts
var preload_exports = {};
module.exports = __toCommonJS(preload_exports);
var import_electron = require("electron");
var electronAPI = {
  searchFiles: (options) => import_electron.ipcRenderer.invoke("search-files", options),
  abortSearch: () => import_electron.ipcRenderer.invoke("abort-search"),
  openFile: (filePath) => import_electron.ipcRenderer.invoke("open-file", filePath),
  openFolder: (folderPath) => import_electron.ipcRenderer.invoke("open-folder", folderPath),
  openPath: (targetPath) => import_electron.ipcRenderer.invoke("open-path", targetPath),
  getSystemDrives: () => import_electron.ipcRenderer.invoke("get-system-drives")
};
import_electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
