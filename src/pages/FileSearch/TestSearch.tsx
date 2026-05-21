import React, { useState } from 'react';
import { Search } from 'lucide-react';

const TestSearch = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testSearch = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    
    try {
      console.log('开始测试搜索...');
      const response = await fetch('/api/search-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          keyword: 'VAT Reports',
          extensions: [],
          searchPath: 'D:\\File_com'
        })
      });
      
      console.log('收到响应:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('数据:', data);
        setResults(data);
      } else {
        const errorText = await response.text();
        console.error('错误:', errorText);
        setError(`错误 ${response.status}: ${errorText}`);
      }
    } catch (err) {
      console.error('捕获错误:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-8 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-zinc-900 mb-6 text-center">搜索测试页面</h1>
        
        <button
          onClick={testSearch}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-all"
        >
          <Search className="w-5 h-5" />
          {loading ? '搜索中...' : '测试搜索'}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="font-semibold">错误：</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6">
            <p className="text-lg font-semibold text-zinc-900 mb-4">
              找到 {results.length} 个结果：
            </p>
            <div className="space-y-3">
              {results.map((file, index) => (
                <div key={index} className="p-4 bg-zinc-50 rounded-xl">
                  <p className="font-medium text-zinc-900">{file.name}</p>
                  <p className="text-sm text-zinc-600 mt-1">{file.path}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    大小: {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSearch;
