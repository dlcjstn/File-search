import { contextBridge, ipcRenderer } from 'electron';

export interface FileSearchResult {
  name: string;
  path: string;
  size: number;
  modifiedDate: string;
  extension: string;
  type: 'file' | 'folder';
  isSystem?: boolean;
  children?: FileSearchResult[];
}

export interface DriveInfo {
  letter: string;
  type: string;
  label: string;
}

export interface ElectronAPI {
  searchFiles: (options: {
    keyword: string;
    extensions: string[];
    searchPath?: string;
  }) => Promise<FileSearchResult[]>;
  abortSearch: () => Promise<{ success: boolean }>;
  openFile: (filePath: string) => Promise<void>;
  openFolder: (folderPath: string) => Promise<void>;
  openPath: (targetPath: string) => Promise<void>;
  getSystemDrives: () => Promise<DriveInfo[]>;
}

const electronAPI: ElectronAPI = {
  searchFiles: (options) => ipcRenderer.invoke('search-files', options),
  abortSearch: () => ipcRenderer.invoke('abort-search'),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
  openPath: (targetPath) => ipcRenderer.invoke('open-path', targetPath),
  getSystemDrives: () => ipcRenderer.invoke('get-system-drives')
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
