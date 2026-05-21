export interface FileSearchResult {
  name: string;
  path: string;
  size: number;
  modifiedDate: string;
  extension: string;
  type: 'file' | 'folder';
  isSystem: boolean;  // 是否为系统文件
  children?: FileSearchResult[];
}

export interface SearchOptions {
  keyword: string;
  extensions: string[];
  searchType: 'name' | 'extension';
  useEverything: boolean;
}

export const COMMON_EXTENSIONS = {
  documents: ['.doc', '.docx', '.pdf', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico'],
  code: ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.html', '.css', '.json'],
  archives: ['.zip', '.rar', '.7z', '.tar', '.gz']
};
