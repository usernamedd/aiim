// Page: P60 全局搜索页
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../components/C05-Avatar/Avatar';
import { EmptyState } from '../../components/C11-EmptyState/EmptyState';
import type { Contact } from '../../../domain/entities/Contact';

type FilterTab = 'all' | 'messages' | 'files' | 'contacts' | 'code';

interface SearchResult {
  type: 'contact' | 'chat' | 'message' | 'file' | 'code';
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  time?: string;
  preview?: string;
}

// Mock recent searches
const RECENT_SEARCHES_KEY = 'aiim_recent_searches';
const getRecentSearches = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
};

const addRecentSearch = (query: string) => {
  if (!query.trim()) return;
  const recent = getRecentSearches();
  const filtered = recent.filter((s) => s !== query);
  const updated = [query, ...filtered].slice(0, 10);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
};

const removeRecentSearch = (query: string) => {
  const recent = getRecentSearches().filter((s) => s !== query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
};

const clearAllRecentSearches = () => {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
};

// Mock suggested searches
const SUGGESTED_SEARCHES = [
  'React 性能优化',
  'TypeScript 泛型',
  'TailwindCSS 布局',
  'Docker 部署',
  'Git 工作流',
];

// Mock search results
const mockSearch = (query: string): SearchResult[] => {
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  // Messages
  if (q.includes('优化') || q.includes('性能')) {
    results.push({
      type: 'message',
      id: 'msg-1',
      title: '前端技术交流群',
      subtitle: '张三：请教如何优化这个函数的性能？',
      avatar: undefined,
      time: '10:30',
      preview: '...如何**优化**这个**函数**的**性能**，最近项目运行变慢...',
    });
    results.push({
      type: 'message',
      id: 'msg-2',
      title: '私聊 - 李四',
      subtitle: '可以使用 memo 来优化...',
      avatar: undefined,
      time: '14:20',
      preview: '可以使用 memo 来**优化**...',
    });
  }

  // Files
  if (q.includes('优化') || q.includes('button')) {
    results.push({
      type: 'file',
      id: 'file-1',
      title: 'Button.tsx',
      subtitle: 'src/components/ui/',
      time: '3天前',
      preview: 'function handle**Optimize**() { ... }',
    });
    results.push({
      type: 'file',
      id: 'file-2',
      title: 'utils.ts',
      subtitle: 'src/utils/',
      time: '1周前',
      preview: 'const **optimize** = (data) => { ... }',
    });
  }

  // Contacts
  if (q.includes('张') || q.includes('李')) {
    results.push({
      type: 'contact',
      id: 'contact-1',
      title: '张三',
      subtitle: '前端工程师',
      avatar: undefined,
    });
    results.push({
      type: 'contact',
      id: 'contact-2',
      title: '李四',
      subtitle: '后端工程师',
      avatar: undefined,
    });
  }

  // Code
  if (q.includes('优化') || q.includes('function')) {
    results.push({
      type: 'code',
      id: 'code-1',
      title: 'helper.ts',
      subtitle: 'src/utils/helper.ts :42',
      preview: 'function handleClick() {\n  const result = **optimize**(data);\n  return result;',
    });
  }

  return results;
};

// Highlight matched text
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
}

export function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const found = mockSearch(query);
      setResults(found);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      setRecentSearches(getRecentSearches());
    }
  }, []);

  const handleResultClick = (result: SearchResult) => {
    if (query.trim()) {
      addRecentSearch(query);
      setRecentSearches(getRecentSearches());
    }

    switch (result.type) {
      case 'contact':
        navigate(`/chat/${result.id}`);
        break;
      case 'chat':
        navigate(`/chat/${result.id}`);
        break;
      case 'message':
        navigate(`/chat/${result.id.split('-')[0] || 'general'}`);
        break;
      case 'file':
        navigate(`/files?highlight=${encodeURIComponent(query)}`);
        break;
      case 'code':
        navigate(`/files?line=42`);
        break;
    }
  };

  const handleRecentItemClick = (searchQuery: string) => {
    setQuery(searchQuery);
    handleSearch(searchQuery);
  };

  const handleRemoveRecent = (searchQuery: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecentSearch(searchQuery);
    setRecentSearches(getRecentSearches());
  };

  // Filter results by tab
  const filteredResults = results.filter((r) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'messages') return r.type === 'message';
    if (activeTab === 'files') return r.type === 'file';
    if (activeTab === 'contacts') return r.type === 'contact';
    if (activeTab === 'code') return r.type === 'code';
    return true;
  });

  // Group results by type
  const groupedResults = {
    messages: filteredResults.filter((r) => r.type === 'message'),
    files: filteredResults.filter((r) => r.type === 'file'),
    contacts: filteredResults.filter((r) => r.type === 'contact'),
    code: filteredResults.filter((r) => r.type === 'code'),
  };

  const tabCounts = {
    all: filteredResults.length,
    messages: groupedResults.messages.length,
    files: groupedResults.files.length,
    contacts: groupedResults.contacts.length,
    code: groupedResults.code.length,
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Search Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            ←
          </button>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="输入搜索关键词..."
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 text-sm font-medium px-2"
          >
            取消
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 px-4 pb-3 overflow-x-auto">
          {(['all', 'messages', 'files', 'contacts', 'code'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {tab === 'all' ? '全部' : tab === 'messages' ? '消息' : tab === 'files' ? '文件' : tab === 'contacts' ? '联系人' : '代码'}
              {tabCounts[tab] > 0 && ` (${tabCounts[tab]})`}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!query.trim() ? (
          /* Empty State - Recent & Suggested */
          <div className="p-4 space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">最近搜索</h3>
                  <button
                    onClick={clearAllRecentSearches}
                    className="text-xs text-slate-500 hover:text-blue-500"
                  >
                    清除
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => handleRecentItemClick(search)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="text-slate-400">🕐</span>
                      <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 text-left">{search}</span>
                      <button
                        onClick={(e) => handleRemoveRecent(search, e)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        ×
                      </button>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Suggested Searches */}
            <section>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">推荐搜索</h3>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SEARCHES.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleRecentItemClick(suggestion)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500 transition-colors"
                  >
                    🔍 {suggestion}
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : isSearching ? (
          /* Loading State */
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-400">搜索中...</div>
          </div>
        ) : filteredResults.length === 0 ? (
          /* No Results */
          <EmptyState
            icon="🔍"
            title="未找到相关结果"
            description="试试其他关键词，或调整筛选条件"
            action={
              <button
                onClick={() => setQuery('')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                清除搜索
              </button>
            }
          />
        ) : (
          /* Search Results */
          <div className="p-4 space-y-6">
            {/* Stats */}
            <div className="text-xs text-slate-500">
              找到 {filteredResults.length} 条结果
            </div>

            {/* Messages Section */}
            {groupedResults.messages.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  💬 消息 <span className="text-slate-400">({groupedResults.messages.length} 条)</span>
                </h3>
                <div className="space-y-2">
                  {groupedResults.messages.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow text-left"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar name={result.title} src={result.avatar} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-900 dark:text-white">{result.title}</span>
                            <span className="text-xs text-slate-400">{result.time}</span>
                          </div>
                          {result.subtitle && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{result.subtitle}</p>
                          )}
                          {result.preview && (
                            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 line-clamp-2">
                              {result.preview}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Files Section */}
            {groupedResults.files.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  📄 文件 <span className="text-slate-400">({groupedResults.files.length} 个)</span>
                </h3>
                <div className="space-y-2">
                  {groupedResults.files.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xl">
                          📄
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-900 dark:text-white">{result.title}</span>
                            <span className="text-xs text-slate-400">{result.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                          {result.preview && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded truncate">
                              {result.preview}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Contacts Section */}
            {groupedResults.contacts.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  👤 联系人 <span className="text-slate-400">({groupedResults.contacts.length} 位)</span>
                </h3>
                <div className="space-y-2">
                  {groupedResults.contacts.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow flex items-center gap-3"
                    >
                      <Avatar name={result.title} src={result.avatar} size="lg" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-slate-900 dark:text-white">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-sm text-slate-500">{result.subtitle}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Code Section */}
            {groupedResults.code.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  📝 代码 <span className="text-slate-400">({groupedResults.code.length} 处)</span>
                </h3>
                <div className="space-y-2">
                  {groupedResults.code.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xl">
                          📝
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white">{result.title}</p>
                          <p className="text-xs text-slate-500">{result.subtitle}</p>
                          {result.preview && (
                            <pre className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-900 p-3 rounded overflow-x-auto">
                              {result.preview}
                            </pre>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Search Tip */}
      <div className="px-4 py-3 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-700">
        按 Enter 搜索，按 ESC 取消
      </div>
    </div>
  );
}