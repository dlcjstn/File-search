import type { FileSearchResult, SearchOptions } from './fileSearch';

export interface ElectronAPI {
  searchWithEverything: (options: SearchOptions) => Promise<FileSearchResult[]>;
  searchFiles: (options: SearchOptions) => Promise<FileSearchResult[]>;
  openFile: (path: string) => Promise<void>;
  openFolder: (path: string) => Promise<void>;
  checkEverything: () => Promise<{ available: boolean }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
