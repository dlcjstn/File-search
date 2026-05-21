#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const app = express();
const PORT = 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));

interface FileSearchResult {
  name: string;
  path: string;
  size: number;
  modifiedDate: string;
  extension: string;
  type: 'file' | 'folder';
  isSystem: boolean;  // 是否为系统文件
  children?: FileSearchResult[];
}

const MAX_RESULTS = 1000;
const REQUEST_TIMEOUT = 60000;

// 检测文件是否为系统文件（Windows）
async function isSystemFile(filePath: string): Promise<boolean> {
  // 仅在Windows上检测
  if (process.platform !== 'win32') {
    return false;
  }

  try {
    // 使用attrib命令检查文件属性
    // S = System file, H = Hidden file
    const { stdout } = await execAsync(`attrib "${filePath}"`, { timeout: 1000 });
    
    // attrib返回格式如: "AHS" 或 "RA" 等
    // 如果包含 'S' (System) 属性，则为系统文件
    if (stdout && stdout.length >= 3) {
      const attributes = stdout.substring(0, 3).toUpperCase();
      return attributes.includes('S');
    }
    return false;
  } catch (error) {
    // 如果检测失败，假设不是系统文件
    return false;
  }
}

async function searchFiles(options: {
  keyword: string;
  extensions: string[];
  searchPath?: string;
}): Promise<FileSearchResult[]> {
  const results: FileSearchResult[] = [];

  console.log('开始搜索文件...');
  console.log('搜索参数:', options);

  const searchPaths = options.searchPath
    ? [options.searchPath]
    : [
        'C:\\',
        'D:\\'
      ];

  let searchedDirs = 0;
  let searchedFiles = 0;
  let errors = 0;
  let lastProgressUpdate = Date.now();

  const startTime = Date.now();

  const searchDirectory = async (dirPath: string, depth: number = 0) => {
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
              // 检测是否为系统文件
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
      console.log(`检查路径: ${searchPath}`);
      await fs.promises.access(searchPath);
      console.log(`路径 ${searchPath} 可访问，开始搜索...`);
      await searchDirectory(searchPath);

      if (results.length > 0) {
        console.log(`在 ${searchPath} 中找到 ${results.length} 个文件，停止搜索`);
        break;
      }
    } catch (err) {
      console.log(`路径 ${searchPath} 不可访问或不存在:`, err);
    }
  }

  console.log('搜索完成统计:', {
    searchedDirs,
    searchedFiles,
    foundFiles: results.length,
    errors,
    time: `${Date.now() - startTime}ms`
  });

  // 将扁平列表转换为树形结构
  const tree = buildFileTree(results, options.searchPath || searchPaths[0] || 'D:\\');

  return tree;
}

function buildFileTree(files: FileSearchResult[], rootPath: string): FileSearchResult[] {
  const tree: FileSearchResult[] = [];
  const pathMap = new Map<string, FileSearchResult>();

  // 规范化路径分隔符
  const normalizedRootPath = rootPath.replace(/\//g, '\\');
  
  // 按路径排序，确保父目录在前
  files.sort((a, b) => a.path.localeCompare(b.path));

  for (const file of files) {
    // 规范化文件路径
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

// GET路由 - 兼容前端
app.get('/api/search', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { keyword, extensions, path: searchPath } = req.query;
    
    console.log('='.repeat(60));
    console.log('收到GET搜索请求:', {
      keyword: keyword || '(空)',
      extensions: extensions || [],
      searchPath: searchPath || '(全部盘符)',
      time: new Date().toISOString()
    });

    const results = await searchFiles({
      keyword: (keyword as string) || '',
      extensions: extensions ? (extensions as string).split(',') : [],
      searchPath: searchPath as string
    });

    console.log(`搜索完成，找到 ${results.length} 个文件，耗时 ${Date.now() - startTime}ms`);
    console.log('='.repeat(60));

    res.json({ results });
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({
      error: '搜索失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

app.post('/api/search-files', async (req, res) => {
  const startTime = Date.now();

  try {
    const { keyword, extensions, searchPath } = req.body;

    console.log('='.repeat(60));
    console.log('收到搜索请求:', {
      keyword: keyword || '(空)',
      extensions: extensions || [],
      searchPath: searchPath || '(全部盘符)',
      time: new Date().toISOString()
    });

    if (!keyword && (!extensions || extensions.length === 0)) {
      res.status(400).json({
        error: '请提供搜索关键词或文件类型'
      });
      return;
    }

    const results = await searchFiles({
      keyword: keyword || '',
      extensions: extensions || [],
      searchPath: searchPath
    });

    console.log(`搜索完成，找到 ${results.length} 个文件，耗时 ${Date.now() - startTime}ms`);
    console.log('='.repeat(60));

    res.json(results);
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({
      error: '搜索失败',
      message: error instanceof Error ? error.message : '未知错误',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

// 打开文件
app.post('/api/open-file', async (req, res) => {
  try {
    const { path: filePath } = req.body;
    
    if (!filePath) {
      res.status(400).json({ error: '缺少文件路径' });
      return;
    }

    console.log('打开文件:', filePath);

    // 使用 Node.js 的 child_process 打开文件
    const { exec } = await import('child_process');
    
    // 根据操作系统选择打开命令
    const isWindows = process.platform === 'win32';
    let command: string;

    if (isWindows) {
      // Windows: 使用 start 命令
      command = `start "" "${filePath}"`;
    } else if (process.platform === 'darwin') {
      // macOS: 使用 open 命令
      command = `open "${filePath}"`;
    } else {
      // Linux: 使用 xdg-open 命令
      command = `xdg-open "${filePath}"`;
    }

    exec(command, (error) => {
      if (error) {
        console.error('打开文件失败:', error);
        res.status(500).json({ error: '打开文件失败', message: error.message });
      } else {
        console.log('文件已打开:', filePath);
        res.json({ success: true, message: '文件已打开' });
      }
    });
  } catch (error) {
    console.error('打开文件异常:', error);
    res.status(500).json({ 
      error: '打开文件失败', 
      message: error instanceof Error ? error.message : '未知错误' 
    });
  }
});

// 打开文件夹
app.post('/api/open-folder', async (req, res) => {
  try {
    const { path: folderPath } = req.body;
    
    if (!folderPath) {
      res.status(400).json({ error: '缺少文件夹路径' });
      return;
    }

    console.log('打开文件夹:', folderPath);

    const { exec } = await import('child_process');
    
    // 根据操作系统选择打开命令
    const isWindows = process.platform === 'win32';
    let command: string;

    if (isWindows) {
      // Windows: 使用 start 命令打开文件夹
      // start 命令更可靠，不会因为 explorer 的退出码而失败
      command = `start "" "${folderPath}"`;
    } else if (process.platform === 'darwin') {
      // macOS: 使用 open 命令
      command = `open "${folderPath}"`;
    } else {
      // Linux: 使用 xdg-open 命令
      command = `xdg-open "${folderPath}"`;
    }

    // 使用 shell 选项执行命令
    exec(command, { shell: true }, (error) => {
      // 对于 Windows 的 explorer/start 命令，即使返回错误也可能成功打开了
      // 所以我们不将 error 视为失败
      if (error && !isWindows) {
        console.error('打开文件夹失败:', error);
        res.status(500).json({ error: '打开文件夹失败', message: error.message });
      } else {
        console.log('文件夹已打开:', folderPath);
        res.json({ success: true, message: '文件夹已打开' });
      }
    });
  } catch (error) {
    console.error('打开文件夹异常:', error);
    res.status(500).json({ 
      error: '打开文件夹失败', 
      message: error instanceof Error ? error.message : '未知错误' 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    message: '服务器运行正常'
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log('✅ 文件搜索服务器启动成功！');
  console.log(`📡 监听端口: http://localhost:${PORT}`);
  console.log('');
  console.log('可用接口:');
  console.log('  POST /api/search-files - 搜索文件');
  console.log('     - keyword: 搜索关键词');
  console.log('     - extensions: 文件类型数组');
  console.log('     - searchPath: 指定搜索路径(可选)');
  console.log('  POST /api/open-file    - 打开文件');
  console.log('     - path: 文件路径');
  console.log('  POST /api/open-folder  - 打开文件夹');
  console.log('     - path: 文件夹路径');
  console.log('  GET  /api/health       - 健康检查');
  console.log('='.repeat(60));
  console.log('');
  console.log('等待搜索请求...');
});
