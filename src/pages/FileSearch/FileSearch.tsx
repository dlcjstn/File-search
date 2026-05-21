import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  Search,
  Folder,
  File,
  ChevronDown,
  ChevronRight,
  List,
  GitBranch,
  Check,
  Loader2,
  Clock,
  X,
  Plus,
  Sparkles,
  Filter,
  ArrowUp,
  ArrowDown,
  FileSearch
} from 'lucide-react';
import { FileSearchResult, COMMON_EXTENSIONS } from '../../types/fileSearch';
import { storageManager } from '../../utils/storageManager';
import '../../types/global.d';

const FileSearchTool: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [treeLayout, setTreeLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [searchResults, setSearchResults] = useState<FileSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showExtensionDropdown, setShowExtensionDropdown] = useState(false);
  const [customExtension, setCustomExtension] = useState('');
  const [extensionError, setExtensionError] = useState('');
  const [searchError, setSearchError] = useState<string>('');
  const [searchTime, setSearchTime] = useState<number>(0);
  const [searchPath, setSearchPath] = useState<string>('');
  const [showPathDropdown, setShowPathDropdown] = useState(false);
  const [systemDrives, setSystemDrives] = useState<Array<{letter: string; type: string; label: string}>>([]);
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSettings, setShowSettings] = useState(false);
  const [maxResults, setMaxResults] = useState<number>(1000);
  const [useMemoCache, setUseMemoCache] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [pathSelectionCount, setPathSelectionCount] = useState<Record<string, number>>({});
  const [extensionSelectionCount, setExtensionSelectionCount] = useState<Record<string, number>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    
    const savedData = storageManager.get();
    console.log('读取保存的配置，剩余有效期:', storageManager.getRemainingDays(), '天');
    
    setMaxResults(savedData.maxResults);
    setUseMemoCache(savedData.useMemoCache);
    setTheme(savedData.theme);
    setPathSelectionCount(savedData.pathSelectionCount);
    setExtensionSelectionCount(savedData.extensionSelectionCount);
    
    isInitializedRef.current = true;
  }, []);

  useEffect(() => {
    const loadSystemDrives = async () => {
      try {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
          const drives = await (window as any).electronAPI.getSystemDrives();
          console.log('获取到系统盘符:', drives);
          if (drives && drives.length > 0) {
            setSystemDrives(drives);
          } else {
            setSystemDrives([
              { letter: 'C:\\', type: ' fixed', label: '系统盘' },
              { letter: 'D:\\', type: ' fixed', label: '数据盘' }
            ]);
          }
        } else {
          setSystemDrives([
            { letter: 'C:\\', type: ' fixed', label: '系统盘' },
            { letter: 'D:\\', type: ' fixed', label: '数据盘' }
          ]);
        }
      } catch (error) {
        console.error('获取系统盘符失败:', error);
        setSystemDrives([
          { letter: 'C:\\', type: ' fixed', label: '系统盘' },
          { letter: 'D:\\', type: ' fixed', label: '数据盘' }
        ]);
      }
    };
    
    loadSystemDrives();
  }, []);

  useEffect(() => {
    console.log('主题useEffect触发，当前theme:', theme);
    
    const applyTheme = () => {
      let effectiveTheme = theme;
      if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      console.log('应用主题 - effectiveTheme:', effectiveTheme);
      
      // 移除所有可能的主题类
      document.documentElement.classList.remove('dark', 'light');
      
      // 应用新主题
      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark');
        console.log('已添加 dark class 到 documentElement');
      } else {
        console.log('保持亮色模式（不添加任何class）');
      }
      
      // 同时更新 body class（确保兼容性）
      document.body.classList.remove('dark', 'light');
      if (effectiveTheme === 'dark') {
        document.body.classList.add('dark');
      }
      
      // 检查是否生效
      setTimeout(() => {
        const hasDark = document.documentElement.classList.contains('dark');
        console.log('验证 - dark class 是否存在:', hasDark);
        console.log('documentElement classes:', document.documentElement.className);
      }, 100);
    };
    
    // 立即应用
    applyTheme();
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        console.log('系统主题变化，重新应用');
        applyTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    storageManager.save({
      maxResults,
      useMemoCache,
      theme,
      pathSelectionCount,
      extensionSelectionCount
    });
  }, [maxResults, useMemoCache, theme, pathSelectionCount, extensionSelectionCount]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSearch = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    abortControllerRef.current = new AbortController();
    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);
    const startTime = Date.now();

    try {
      let results: FileSearchResult[] = [];
      
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        results = await (window as any).electronAPI.searchFiles({
          keyword: searchKeyword,
          extensions: selectedExtensions,
          searchPath: searchPath
        });
      } else {
        const params = new URLSearchParams({
          ...(searchKeyword.trim() && { keyword: searchKeyword }),
          ...(selectedExtensions.length > 0 && { extensions: selectedExtensions.join(',') }),
          ...(searchPath && { path: searchPath })
        });

        const response = await fetch(`/api/search?${params}`, {
          signal: abortControllerRef.current.signal
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`请求错误 ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        results = data.results || [];
      }
      
      setSearchResults(results);
      setSearchTime(Date.now() - startTime);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('搜索已取消');
        setSearchError('搜索已取消');
        setSearchResults([]);
      } else {
        const errorMessage = error instanceof Error ? error.message : '搜索失败';
        console.error('搜索失败:', errorMessage);
        setSearchError(errorMessage);
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
      abortControllerRef.current = null;
    }
  }, [searchKeyword, selectedExtensions, searchPath]);

  const handleStopSearch = useCallback(async () => {
    console.log('停止搜索按钮被点击');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('已调用 abort');
    }
    
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        await (window as any).electronAPI.abortSearch();
        console.log('后端搜索已中止');
      } catch (error) {
        console.error('中止搜索失败:', error);
      }
    }
    
    setIsSearching(false);
    setSearchError('搜索已停止');
  }, []);

  const toggleExtension = (ext: string) => {
    const newExtensions = selectedExtensions.includes(ext) 
      ? selectedExtensions.filter(e => e !== ext) 
      : [...selectedExtensions, ext];
    setSelectedExtensions(newExtensions);
    
    if (!selectedExtensions.includes(ext)) {
      setExtensionSelectionCount(prev => ({
        ...prev,
        [ext]: (prev[ext] || 0) + 1
      }));
    }
  };

  const handleAddCustomExtension = () => {
    const input = customExtension.trim();
    if (!input) {
      setExtensionError('请输入后缀名');
      return;
    }
    let ext = input;
    if (!ext.startsWith('.')) {
      ext = '.' + ext;
    }
    if (selectedExtensions.includes(ext)) {
      setExtensionError(`"${ext}" 已存在`);
      return;
    }
    setSelectedExtensions(prev => [...prev, ext]);
    setExtensionSelectionCount(prev => ({
      ...prev,
      [ext]: (prev[ext] || 0) + 1
    }));
    setCustomExtension('');
    setExtensionError('');
  };

  const handleOpenFile = async (file: FileSearchResult) => {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        await (window as any).electronAPI.openFile(file.path);
      } else {
        const response = await fetch('/api/open-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: file.path })
        });
        if (!response.ok) {
          throw new Error(response.statusText || '打开文件失败');
        }
      }
      console.log('文件已打开:', file.name);
    } catch (error) {
      console.error('打开文件失败:', error);
      alert('无法打开文件: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleOpenFolder = async (folderPath: string) => {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        await (window as any).electronAPI.openFolder(folderPath);
      } else {
        const response = await fetch('/api/open-folder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: folderPath })
        });
        if (!response.ok) {
          throw new Error(response.statusText || '打开文件夹失败');
        }
      }
      console.log('文件夹已打开:', folderPath);
    } catch (error) {
      console.error('打开文件夹失败:', error);
      alert('无法打开文件夹: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFolderColor = (level: number) => {
    const colors = [
      'text-blue-600 dark:text-blue-400',
      'text-purple-600 dark:text-purple-400',
      'text-green-600 dark:text-green-400',
      'text-orange-600 dark:text-orange-400',
      'text-pink-600 dark:text-pink-400',
      'text-cyan-600 dark:text-cyan-400',
      'text-indigo-600 dark:text-indigo-400',
      'text-teal-600 dark:text-teal-400'
    ];
    return colors[level % colors.length];
  };

  const getFolderPath = (filePath: string): string => {
    const parts = filePath.split(/[\\/]/);
    parts.pop();
    return parts.join('\\');
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <ArrowUp className="w-3 h-3 opacity-30" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-blue-600" />
      : <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  const SimpleListView = ({ items }: { items: FileSearchResult[] }) => {
    const sortedItems = useMemoCache 
      ? useMemo(() => {
          if (!sortField) return items;
          return [...items].sort((a, b) => {
            let result: number;
            switch (sortField) {
              case 'name':
                result = a.name.localeCompare(b.name, undefined, {
                  sensitivity: 'base',
                  numeric: true
                });
                return sortOrder === 'asc' ? result : -result;
              case 'folder':
                const aPath = getFolderPath(a.path);
                const bPath = getFolderPath(b.path);
                result = aPath.localeCompare(bPath, undefined, {
                  sensitivity: 'base',
                  numeric: true
                });
                return sortOrder === 'asc' ? result : -result;
              case 'extension':
                const aExt = a.extension || '';
                const bExt = b.extension || '';
                if (aExt.length !== bExt.length) {
                  return sortOrder === 'asc' 
                    ? aExt.length - bExt.length 
                    : bExt.length - aExt.length;
                }
                result = aExt.localeCompare(bExt, undefined, {
                  sensitivity: 'base'
                });
                return sortOrder === 'asc' ? result : -result;
              case 'size':
                return sortOrder === 'asc' 
                  ? a.size - b.size 
                  : b.size - a.size;
              case 'isSystem':
                const aSys = a.isSystem ? 1 : 0;
                const bSys = b.isSystem ? 1 : 0;
                return sortOrder === 'asc' 
                  ? aSys - bSys 
                  : bSys - aSys;
              default:
                return 0;
            }
          });
        }, [items, sortField, sortOrder])
      : (() => {
          if (!sortField) return items;
          return [...items].sort((a, b) => {
            let result: number;
            switch (sortField) {
              case 'name':
                result = a.name.localeCompare(b.name, undefined, {
                  sensitivity: 'base',
                  numeric: true
                });
                return sortOrder === 'asc' ? result : -result;
              case 'folder':
                const aPath = getFolderPath(a.path);
                const bPath = getFolderPath(b.path);
                result = aPath.localeCompare(bPath, undefined, {
                  sensitivity: 'base',
                  numeric: true
                });
                return sortOrder === 'asc' ? result : -result;
              case 'extension':
                const aExt = a.extension || '';
                const bExt = b.extension || '';
                if (aExt.length !== bExt.length) {
                  return sortOrder === 'asc' 
                    ? aExt.length - bExt.length 
                    : bExt.length - aExt.length;
                }
                result = aExt.localeCompare(bExt, undefined, {
                  sensitivity: 'base'
                });
                return sortOrder === 'asc' ? result : -result;
              case 'size':
                return sortOrder === 'asc' 
                  ? a.size - b.size 
                  : b.size - a.size;
              case 'isSystem':
                const aSys = a.isSystem ? 1 : 0;
                const bSys = b.isSystem ? 1 : 0;
                return sortOrder === 'asc' 
                  ? aSys - bSys 
                  : bSys - aSys;
              default:
                return 0;
            }
          });
        })();
    
    return (
      <div className="w-full">
        <div className="flex items-center gap-4 px-6 py-3 bg-zinc-100 dark:bg-zinc-700 border-b-2 border-zinc-300 dark:border-zinc-600 font-semibold text-zinc-700 dark:text-zinc-200 text-xs sticky top-0 z-10">
          <div className="w-[50%] text-left flex items-center gap-2 cursor-pointer" onClick={() => handleSort('name')}>
            文件名 <SortIcon field="name" />
          </div>
          <div className="w-[40%] text-left flex items-center gap-2 cursor-pointer" onClick={() => handleSort('folder')}>
            文件夹 <SortIcon field="folder" />
          </div>
          <div className="w-[5%] text-left flex items-center gap-2 cursor-pointer" onClick={() => handleSort('extension')}>
            类型 <SortIcon field="extension" />
          </div>
          <div className="w-[5%] text-left flex items-center gap-2 cursor-pointer" onClick={() => handleSort('size')}>
            文件大小 <SortIcon field="size" />
          </div>
        </div>
        
        <div className="divide-y divide-zinc-100 dark:divide-zinc-700">
          {sortedItems.map((result, index) => (
            <div
              key={`${result.path}-${index}`}
              className="group flex items-center gap-4 px-6 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-all duration-150"
              onDoubleClick={() => result.type === 'file' ? handleOpenFile(result) : handleOpenFolder(result.path)}
            >
              <div className="flex-shrink-0 w-6">
                {result.type === 'folder' ? (
                  <Folder className="w-6 h-6 text-blue-500" />
                ) : (
                  <File className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              
              <div className="w-[50%] min-w-0">
                <div className={`font-medium break-words transition-colors leading-relaxed ${
                  result.type === 'folder' ? 'text-zinc-800 dark:text-zinc-200 group-hover:text-blue-700 dark:group-hover:text-blue-300' : 'text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-300'
                }`}>
                  {result.name}
                </div>
              </div>
              
              <div className="w-[40%]">
                <div 
                  className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 break-words hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-relaxed"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const folderPath = getFolderPath(result.path);
                    handleOpenFolder(folderPath);
                  }}
                  title={getFolderPath(result.path)}
                >
                  <Folder className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="break-all">{getFolderPath(result.path)}</span>
                </div>
              </div>
              
              <div className="w-[5%] text-left">
                <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded">
                  {result.type === 'file' ? result.extension || '文件' : '文件夹'}
                </span>
              </div>
              
              <div className="w-[5%] text-left tabular-nums font-mono text-xs text-zinc-700 dark:text-zinc-300">
                {result.type === 'file' ? formatFileSize(result.size) : '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TreeViewItem = ({ item, level = 0 }: { item: FileSearchResult; level?: number }) => {
    const isExpanded = expandedFolders.has(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const folderColor = getFolderColor(level);

    return (
      <div className="animate-fade-in">
        <div
          className={`group flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer rounded-lg transition-all ${
            item.type === 'folder' 
              ? `font-medium ${folderColor} border border-zinc-200/60 dark:border-zinc-600/60 bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm shadow-sm hover:shadow-md` 
              : 'text-zinc-700 dark:text-zinc-300'
          }`}
          onClick={() => {
            if (item.type === 'folder') {
              const newExpanded = new Set(expandedFolders);
              if (isExpanded) {
                newExpanded.delete(item.path);
              } else {
                newExpanded.add(item.path);
              }
              setExpandedFolders(newExpanded);
            }
          }}
          onDoubleClick={() => {
            if (item.type === 'file') {
              handleOpenFile(item);
            } else {
              handleOpenFolder(item.path);
            }
          }}
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          {item.type === 'folder' ? (
            <>
              {hasChildren ? (
                <span className="w-4 h-4 flex items-center justify-center">
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                </span>
              ) : (
                <span className="w-4 h-4" />
              )}
              <Folder className="w-5 h-5 flex-shrink-0" />
            </>
          ) : (
            <>
              <span className="w-4" />
              <File className="w-5 h-5 flex-shrink-0 text-zinc-400" />
            </>
          )}
          <span className="truncate">{item.name}</span>
          {item.type === 'file' && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-2">
              ({formatFileSize(item.size)})
            </span>
          )}
          {item.isSystem && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded ml-2">
              系统
            </span>
          )}
        </div>
        
        {item.type === 'folder' && isExpanded && item.children && (
          <div>
            {treeLayout === 'horizontal' ? (
              <div className="flex flex-wrap items-start gap-3 ml-4">
                {item.children.map((child, index) => (
                  <TreeViewItem key={`${child.path}-${index}`} item={child} level={level + 1} />
                ))}
              </div>
            ) : (
              <div className="ml-4 border-l-2 border-zinc-200 dark:border-zinc-600">
                {item.children.map((child, index) => (
                  <TreeViewItem key={`${child.path}-${index}`} item={child} level={level + 1} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const extractAllFiles = (items: FileSearchResult[]): FileSearchResult[] => {
    const files: FileSearchResult[] = [];
    const traverse = (items: FileSearchResult[]) => {
      items.forEach(item => {
        if (item.type === 'file') {
          files.push(item);
        }
        if (item.children) {
          traverse(item.children);
        }
      });
    };
    traverse(items);
    return files;
  };
  
  const displayedResults = useMemo(() => {
    let results = viewMode === 'tree' 
      ? searchResults
      : extractAllFiles(searchResults);
    if (results.length > maxResults) {
      results = results.slice(0, maxResults);
    }
    return results;
  }, [searchResults, viewMode, maxResults]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-50 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="max-w-[1800px] mx-auto px-8 py-10 relative">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-medium rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            文档检索工具
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">
            检索文档
          </h1>
          
          <button
            onClick={() => setShowSettings(true)}
            className="absolute top-8 right-8 p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            title="设置"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-700 overflow-hidden mb-8">
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-700">
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-2xl" />
                <div className="relative flex items-center gap-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="输入文件名或关键词以及后缀名"
                    className="w-full pl-12 pr-4 py-3.5 text-base bg-zinc-50/80 dark:bg-zinc-700 border-2 border-zinc-200 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-600 transition-all outline-none"
                    disabled={isSearching}
                  />
                  <button
                    onClick={() => isSearching ? handleStopSearch() : handleSearch()}
                    disabled={false}
                    className={`group relative px-6 py-3.5 font-semibold rounded-2xl transition-all duration-200 shadow-xl active:scale-95 flex items-center gap-3 whitespace-nowrap ${
                      isSearching
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 cursor-pointer'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/30'
                    } text-white disabled:cursor-not-allowed disabled:shadow-none`}
                  >
                    <span className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>停止搜索</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>开始搜索</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {isSearching && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <div>
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-200">正在搜索文件...</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      搜索路径: {searchPath || '全部磁盘'} | 关键词: {searchKeyword}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                onClick={() => setShowPathDropdown(!showPathDropdown)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  searchPath 
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800' 
                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                  {searchPath || '搜索路径'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showPathDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showPathDropdown && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                  onClick={() => setShowPathDropdown(false)}
                >
                  <div 
                    className="w-[800px] h-[500px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-1/2 border-r border-zinc-200 dark:border-zinc-700 flex flex-col">
                      <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">选择搜索路径</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSearchPath('')}
                            className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                          >
                            取消选择
                          </button>
                          <button
                            onClick={() => setShowPathDropdown(false)}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                          >
                            确认
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-5 space-y-2">
                        <button
                          onClick={() => {
                            setSearchPath('');
                            setPathSelectionCount(prev => ({
                              ...prev,
                              '__all__': (prev['__all__'] || 0) + 1
                            }));
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            !searchPath ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <div className="text-xs font-medium">全部磁盘</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">搜索所有可用磁盘</div>
                        </button>
                        {systemDrives.length > 0 ? (
                          systemDrives.map((drive) => (
                            <button
                              key={drive.letter}
                              onClick={() => {
                                const path = drive.letter.endsWith('\\') ? drive.letter : drive.letter + '\\';
                                setSearchPath(path);
                                setPathSelectionCount(prev => ({
                                  ...prev,
                                  [path]: (prev[path] || 0) + 1
                                }));
                              }}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                searchPath === drive.letter || searchPath === drive.letter + '\\' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              <div className="text-xs font-medium">{drive.letter} {drive.label && `(${drive.label})`}</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                {drive.type === ' removable' ? '可移动磁盘' : '本地磁盘'}
                              </div>
                            </button>
                          ))
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setSearchPath('C:\\');
                                setPathSelectionCount(prev => ({
                                  ...prev,
                                  'C:\\': (prev['C:\\'] || 0) + 1
                                }));
                              }}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                searchPath === 'C:\\' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              <div className="text-xs font-medium">C:\ 磁盘</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">系统盘</div>
                            </button>
                            <button
                              onClick={() => {
                                setSearchPath('D:\\');
                                setPathSelectionCount(prev => ({
                                  ...prev,
                                  'D:\\': (prev['D:\\'] || 0) + 1
                                }));
                              }}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                searchPath === 'D:\\' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              <div className="text-xs font-medium">D:\ 磁盘</div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">数据盘</div>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="w-1/2 flex flex-col bg-zinc-50 dark:bg-zinc-900">
                      <div className="p-5 border-b border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">自定义路径</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">输入完整的文件夹路径</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-5">
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">输入路径</div>
                            <input
                              type="text"
                              value={searchPath}
                              onChange={(e) => setSearchPath(e.target.value)}
                              placeholder="如 D:\File_com"
                              className="w-full px-3 py-2.5 text-xs border-2 border-zinc-200 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                            />
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <div className="text-xs text-blue-700 dark:text-blue-300">
                              <div className="font-medium mb-1">路径格式说明</div>
                              <div className="text-blue-600 dark:text-blue-400 space-y-1">
                                <div>• Windows: D:\File_com</div>
                                <div>• 支持网络路径: \\192.168.1.1\share</div>
                              </div>
                            </div>
                          </div>
                          {Object.keys(pathSelectionCount).length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">常用选择</div>
                              <div className="space-y-1.5">
                                {Object.entries(pathSelectionCount)
                                  .sort((a, b) => b[1] - a[1])
                                  .slice(0, 5)
                                  .map(([path, count]) => (
                                    <button
                                      key={path}
                                      onClick={() => {
                                        const finalPath = path === '__all__' ? '' : path;
                                        setSearchPath(finalPath);
                                        setPathSelectionCount(prev => ({
                                          ...prev,
                                          [path]: (prev[path] || 0) + 1
                                        }));
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors flex items-center justify-between"
                                    >
                                      <span className="truncate">{path === '__all__' ? '全部磁盘' : path}</span>
                                      <span className="text-zinc-400 dark:text-zinc-500 ml-2 flex-shrink-0">{count}次</span>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowExtensionDropdown(!showExtensionDropdown)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  selectedExtensions.length > 0 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800' 
                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                  {selectedExtensions.length === 0 ? '选择文件类型' : `已选 ${selectedExtensions.length} 种`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showExtensionDropdown ? 'rotate-180' : ''}`} />
              </button>

              {selectedExtensions.length > 0 && (
                <button
                  onClick={() => setSelectedExtensions([])}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  清除筛选
                </button>
              )}
            </div>

            {showExtensionDropdown && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                onClick={() => setShowExtensionDropdown(false)}
              >
                <div 
                  className="w-[800px] max-h-[85vh] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-1/2 border-r border-zinc-200 dark:border-zinc-700 flex flex-col">
                    <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-700">
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">选择文件类型</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedExtensions([])}
                          className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          取消选择
                        </button>
                        <button
                          onClick={() => setShowExtensionDropdown(false)}
                          className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          确认
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                      <div>
                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">文档</div>
                        <div className="flex flex-wrap gap-1.5">
                          {COMMON_EXTENSIONS.documents.map(ext => (
                            <button
                              key={ext}
                              onClick={() => toggleExtension(ext)}
                              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-150 ${
                                selectedExtensions.includes(ext)
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                              }`}
                            >
                              {selectedExtensions.includes(ext) && <Check className="w-3 h-3 inline mr-1" />}
                              {ext}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">图片</div>
                        <div className="flex flex-wrap gap-1.5">
                          {COMMON_EXTENSIONS.images.map(ext => (
                            <button
                              key={ext}
                              onClick={() => toggleExtension(ext)}
                              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-150 ${
                                selectedExtensions.includes(ext)
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                              }`}
                            >
                              {selectedExtensions.includes(ext) && <Check className="w-3 h-3 inline mr-1" />}
                              {ext}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">代码</div>
                        <div className="flex flex-wrap gap-1.5">
                          {COMMON_EXTENSIONS.code.map(ext => (
                            <button
                              key={ext}
                              onClick={() => toggleExtension(ext)}
                              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-150 ${
                                selectedExtensions.includes(ext)
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                              }`}
                            >
                              {selectedExtensions.includes(ext) && <Check className="w-3 h-3 inline mr-1" />}
                              {ext}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">压缩包</div>
                        <div className="flex flex-wrap gap-1.5">
                          {COMMON_EXTENSIONS.archives.map(ext => (
                            <button
                              key={ext}
                              onClick={() => toggleExtension(ext)}
                              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-150 ${
                                selectedExtensions.includes(ext)
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                              }`}
                            >
                              {selectedExtensions.includes(ext) && <Check className="w-3 h-3 inline mr-1" />}
                              {ext}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/2 flex flex-col bg-zinc-50 dark:bg-zinc-900">
                    <div className="p-5 border-b border-zinc-200 dark:border-zinc-700">
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">自定义后缀</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">添加常用但未预设的文件类型</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5">
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">输入后缀名</div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={customExtension}
                              onChange={(e) => {
                                setCustomExtension(e.target.value);
                                setExtensionError('');
                              }}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomExtension()}
                              placeholder=".myext"
                              className="flex-1 px-3 py-2 text-xs border-2 border-zinc-200 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                            />
                            <button
                              onClick={handleAddCustomExtension}
                              className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-md flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              添加
                            </button>
                          </div>
                          {extensionError && (
                            <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg">
                              <X className="w-3.5 h-3.5" />
                              {extensionError}
                            </div>
                          )}
                          {Object.keys(extensionSelectionCount).length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">常用选择</div>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(extensionSelectionCount)
                                  .sort((a, b) => b[1] - a[1])
                                  .slice(0, 5)
                                  .map(([ext, count]) => (
                                    <button
                                      key={ext}
                                      onClick={() => toggleExtension(ext)}
                                      className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-150 ${
                                        selectedExtensions.includes(ext)
                                          ? 'bg-blue-600 text-white shadow-md'
                                          : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                                      }`}
                                    >
                                      {selectedExtensions.includes(ext) && <Check className="w-3 h-3 inline mr-1" />}
                                      {ext} <span className="text-zinc-400 ml-1">({count})</span>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-700 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-zinc-600 text-blue-600 shadow-md'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                    }`}
                    title="列表视图"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'tree'
                        ? 'bg-white dark:bg-zinc-600 text-blue-600 shadow-md'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                    }`}
                    title="树状视图"
                  >
                    <GitBranch className="w-4 h-4" />
                  </button>
                </div>
                
                {viewMode === 'tree' && (
                  <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-700 p-1 rounded-lg">
                    <button
                      onClick={() => setTreeLayout('horizontal')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        treeLayout === 'horizontal'
                          ? 'bg-white dark:bg-zinc-600 text-blue-600 shadow-md'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      }`}
                      title="横向布局"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setTreeLayout('vertical')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        treeLayout === 'vertical'
                          ? 'bg-white dark:bg-zinc-600 text-blue-600 shadow-md'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      }`}
                      title="竖向布局"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6v12m0 0h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {viewMode === 'tree' && searchResults.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const allPaths = new Set<string>();
                        const collectPaths = (items: FileSearchResult[]) => {
                          items.forEach(item => {
                            if (item.type === 'folder') {
                              allPaths.add(item.path);
                              if (item.children) collectPaths(item.children);
                            }
                          });
                        };
                        collectPaths(searchResults);
                        setExpandedFolders(allPaths);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 text-xs font-medium rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
                      title="展开全部"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      展开全部
                    </button>
                    <button
                      onClick={() => setExpandedFolders(new Set())}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                      title="合并全部"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      合并全部
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {displayedResults.length > 0 && (
            <div className="px-4 py-5 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
                  搜索结果
                </h2>
                {displayedResults.length > 0 && (
                  <span className="px-3.5 py-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 text-xs font-semibold rounded-full flex items-center gap-1.5">
                    <Search className="w-4 h-4" />
                    {displayedResults.length} 个结果
                  </span>
                )}
                {searchTime > 0 && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    {(searchTime / 1000).toFixed(2)}秒
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="overflow-auto max-h-[600px]">
            {searchError && (
              <div className="p-8 text-center">
                <div className="inline-flex flex-col items-center gap-3 text-red-600 dark:text-red-400">
                  <X className="w-12 h-12" />
                  <p className="text-lg font-medium">{searchError}</p>
                </div>
              </div>
            )}
            
            {displayedResults.length > 0 && (
              viewMode === 'list' ? (
                <SimpleListView items={displayedResults} />
              ) : (
                <div className="p-6">
                  {displayedResults.map((result, index) => (
                    <TreeViewItem key={`${result.path}-${index}`} item={result} />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {showSettings && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={() => setShowSettings(false)}
        >
          <div 
            className="w-[500px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">设置</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  数据量上限
                </label>
                <input
                  type="number"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value) || 1000)}
                  min="100"
                  max="10000"
                  className="w-full px-4 py-2.5 text-sm border-2 border-zinc-200 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                  设置搜索结果的最大显示数量（100-10000）
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  缓存机制
                </label>
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-700 rounded-xl">
                  <div>
                    <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">使用 useMemo 缓存</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      启用后可提升大量数据时的排序性能
                    </div>
                  </div>
                  <button
                    onClick={() => setUseMemoCache(!useMemoCache)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      useMemoCache ? 'bg-blue-600' : 'bg-zinc-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        useMemoCache ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  主题
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg className={`w-8 h-8 ${theme === 'light' ? 'text-blue-600' : 'text-zinc-600 dark:text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className={`text-xs font-medium ${theme === 'light' ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        亮色
                      </span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-600' : 'text-zinc-600 dark:text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span className={`text-xs font-medium ${theme === 'dark' ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        暗色
                      </span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setTheme('system')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === 'system'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg className={`w-8 h-8 ${theme === 'system' ? 'text-blue-600' : 'text-zinc-600 dark:text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className={`text-xs font-medium ${theme === 'system' ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        随系统
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
              <button
                onClick={() => setShowSettings(false)}
                className="px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-md"
              >
                应用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileSearchTool;
