import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface FileSearchResult {
  name: string;
  path: string;
  size: number;
  modifiedDate: string;
  extension: string;
  type: 'file' | 'folder';
  isSystem?: boolean;
  children?: FileSearchResult[];
}

const MAX_RESULTS = 10000;
const REQUEST_TIMEOUT = 60000;

let mainWindow: BrowserWindow | null = null;
let isSearchAborted = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  }
  if (process.env.NODE_ENV !== 'development') {
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

async function isSystemFile(filePath: string): Promise<boolean> {
  if (process.platform !== 'win32') {
    return false;
  }

  try {
    const { stdout } = await execAsync(`attrib "${filePath}"`, { timeout: 1000 });
    
    if (stdout && stdout.length >= 3) {
      const attributes = stdout.substring(0, 3).toUpperCase();
      return attributes.includes('S');
    }
    return false;
  } catch (error) {
    return false;
  }
}

async function searchFiles(options: {
  keyword: string;
  extensions: string[];
  searchPath?: string;
}): Promise<FileSearchResult[]> {
  const results: FileSearchResult[] = [];
  isSearchAborted = false;

  const searchPaths = options.searchPath
    ? [options.searchPath]
    : ['C:\\', 'D:\\'];

  let searchedDirs = 0;
  let searchedFiles = 0;
  let errors = 0;
  let lastProgressUpdate = Date.now();

  const startTime = Date.now();

  const searchDirectory = async (dirPath: string, depth: number = 0) => {
    if (isSearchAborted) {
      console.log('搜索已中止');
      return;
    }
    
    if (Date.now() - startTime > REQUEST_TIMEOUT) {
      console.log('搜索超时，停止搜索');
      return;
    }

    if (depth > 8 || results.length >= MAX_RESULTS) return;
    if (searchedDirs > 50000) return;

    searchedDirs++;

    if (Date.now() - lastProgressUpdate > 3000) {
      lastProgressUpdate = Date.now();
      console.log(`进度: 已扫描 ${searchedDirs} 个目录, ${searchedFiles} 个文件, 找到 ${results.length} 个匹配...`);
    }

    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (isSearchAborted) {
          console.log('搜索已中止');
          break;
        }
        
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
                type: 'file',
                isSystem: systemFile
              });
            }
          } else if (stats.isDirectory() && !entry.name.startsWith('.')) {
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
        console.log(`在 ${searchPath} 中找到 ${results.length} 个文件，停止搜索`);
        break;
      }
    } catch (err) {
      console.log(`路径 ${searchPath} 不可访问或不存在`);
    }
  }

  console.log('搜索完成统计:', {
    searchedDirs,
    searchedFiles,
    foundFiles: results.length,
    errors,
    time: `${Date.now() - startTime}ms`
  });

  return results;
}

function buildFileTree(files: FileSearchResult[], rootPath: string): FileSearchResult[] {
  const tree: FileSearchResult[] = [];
  const pathMap = new Map<string, FileSearchResult>();

  const normalizedRootPath = rootPath.replace(/\//g, '\\');
  
  files.sort((a, b) => a.path.localeCompare(b.path));

  for (const file of files) {
    const normalizedFilePath = file.path.replace(/\//g, '\\');
    const relativePath = normalizedFilePath.replace(normalizedRootPath, '').replace(/^[\\\/]+/, '');
    const parts = relativePath.split(/[\\\/]/).filter(Boolean);
    
    let currentPath = normalizedRootPath;
    let parentChildren = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = path.join(currentPath, parts[i]);

      if (!pathMap.has(currentPath)) {
        const folderNode: FileSearchResult = {
          name: parts[i],
          path: currentPath,
          size: 0,
          modifiedDate: '',
          extension: '',
          type: 'folder',
          children: []
        };
        pathMap.set(currentPath, folderNode);
        parentChildren.push(folderNode);
      }

      const parentNode = pathMap.get(currentPath)!;
      parentChildren = parentNode.children!;
    }

    parentChildren.push(file);
  }

  return tree;
}

function setupIpcHandlers() {
  ipcMain.handle('get-system-drives', async () => {
    try {
      const isWindows = process.platform === 'win32';
      
      if (isWindows) {
        const { stdout } = await execAsync('wmic logicaldisk get name,drivetype,volumename', { timeout: 5000 });
        const lines = stdout.split('\n').filter(line => line.trim());
        const drives = [];
        
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].trim().split(/\s+/);
          if (parts.length >= 2) {
            const driveLetter = parts[0];
            const driveType = parseInt(parts[1]);
            const volumeName = parts.slice(2).join(' ') || '';
            
            if (driveType === 2 || driveType === 3) {
              drives.push({
                letter: driveLetter,
                type: driveType === 2 ? ' removable' : ' fixed',
                label: volumeName
              });
            }
          }
        }
        
        return drives;
      } else {
        return [];
      }
    } catch (error) {
      console.error('获取系统盘符失败:', error);
      return [];
    }
  });

  ipcMain.handle('search-files', async (_event, options) => {
    console.log('收到搜索请求:', options);
    isSearchAborted = false;
    const files = await searchFiles(options);
    const tree = buildFileTree(files, options.searchPath || 'D:\\');
    return tree;
  });

  ipcMain.handle('abort-search', async () => {
    console.log('收到中止搜索请求');
    isSearchAborted = true;
    return { success: true };
  });

  ipcMain.handle('open-file', async (_event, filePath: string) => {
    try {
      const isWindows = process.platform === 'win32';
      let command: string;

      if (isWindows) {
        command = `start "" "${filePath}"`;
      } else if (process.platform === 'darwin') {
        command = `open "${filePath}"`;
      } else {
        command = `xdg-open "${filePath}"`;
      }

      exec(command, (error) => {
        if (error) {
          console.error('打开文件失败:', error);
        } else {
          console.log('文件已打开:', filePath);
        }
      });
    } catch (error) {
      console.error('打开文件异常:', error);
      throw error;
    }
  });

  ipcMain.handle('open-folder', async (_event, folderPath: string) => {
    try {
      const isWindows = process.platform === 'win32';
      let command: string;

      if (isWindows) {
        command = `start "" "${folderPath}"`;
      } else if (process.platform === 'darwin') {
        command = `open "${folderPath}"`;
      } else {
        command = `xdg-open "${folderPath}"`;
      }

      const execOptions = isWindows ? { shell: 'cmd.exe' } : { shell: '/bin/bash' };
      exec(command, execOptions, (error) => {
        if (error) {
          console.error('打开文件夹失败:', error);
        } else {
          console.log('文件夹已打开:', folderPath);
        }
      });
    } catch (error) {
      console.error('打开文件夹异常:', error);
      throw error;
    }
  });

  ipcMain.handle('open-path', async (_event, targetPath: string) => {
    try {
      await shell.showItemInFolder(targetPath);
    } catch (error) {
      console.error('打开路径失败:', error);
      throw error;
    }
  });
}
