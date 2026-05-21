const STORAGE_KEY = 'fileSearchConfig';
const EXPIRY_DAYS = 7;

interface StorageData {
  maxResults: number;
  useMemoCache: boolean;
  theme: 'light' | 'dark' | 'system';
  pathSelectionCount: Record<string, number>;
  extensionSelectionCount: Record<string, number>;
  currentPath: string;
  currentExtensions: string[];
  savedAt: number;
}

const createStorageManager = () => {
  const isExpired = (savedAt: number): boolean => {
    const now = Date.now();
    const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    return now - savedAt > expiryTime;
  };

  const getDefaultData = (): StorageData => ({
    maxResults: 1000,
    useMemoCache: true,
    theme: 'system',
    pathSelectionCount: {},
    extensionSelectionCount: {},
    currentPath: '',
    currentExtensions: [],
    savedAt: Date.now()
  });

  const save = (data: Partial<StorageData>): void => {
    try {
      const existingData = get();
      const newData: StorageData = {
        ...existingData,
        ...data,
        savedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      console.log('配置已保存，有效期7天');
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  };

  const get = (): StorageData => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return getDefaultData();
      }
      
      const data: StorageData = JSON.parse(stored);
      
      if (isExpired(data.savedAt)) {
        console.log('配置已过期，清除旧数据');
        clear();
        return getDefaultData();
      }
      
      return data;
    } catch (error) {
      console.error('读取配置失败:', error);
      return getDefaultData();
    }
  };

  const clear = (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('配置已清除');
    } catch (error) {
      console.error('清除配置失败:', error);
    }
  };

  const getRemainingDays = (): number => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return 0;
      
      const data: StorageData = JSON.parse(stored);
      const now = Date.now();
      const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const elapsed = now - data.savedAt;
      const remaining = expiryTime - elapsed;
      
      return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
    } catch (error) {
      return 0;
    }
  };

  return {
    save,
    get,
    clear,
    getRemainingDays
  };
};

export const storageManager = createStorageManager();
