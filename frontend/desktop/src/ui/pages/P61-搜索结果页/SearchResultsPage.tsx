// Page: P61 搜索结果页
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Avatar } from '../../components/C05-Avatar/Avatar';
import { EmptyState } from '../../components/C11-EmptyState/EmptyState';

type FilterTab = 'all' | 'messages' | 'files' | 'contacts' | 'code';
type SortType = 'relevance' | 'time-desc' | 'time-asc';

interface SearchResult {
  type: 'contact' | 'chat' | 'message' | 'file' | 'code';
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  time?: string;
  preview?: string;
}

// Mock search results data
const mockSearch = (query: string): SearchResult[] => {
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  // Messages
  if (q.includes('优化') || q.includes('性能') || q.includes('react')) {
    results.push({
      type: 'message',
      id: 'msg-1',
      title: '前端技术交流群',
      subtitle: '张三：请教如何优化这个函数的性能？',
      avatar: undefined,
      time: '2026-05-24 10:30',
      preview: '...如何**优化**这个**函数**的**性能**，最近项目运行变慢，需要优化一下...',
    });
    results.push({
      type: 'message',
      id: 'msg-2',
      title: '私聊 - 李四',
      subtitle: '可以使用 memo 来优化...',
      avatar: undefined,
      time: '2026-05-23 14:20',
      preview: '可以使用 memo 来**优化** React 组件渲染性能...',
    });
    results.push({
      type: 'message',
      id: 'msg-3',
      title: '前端技术交流群',
      subtitle: '王五：关于性能优化的一些经验',
      avatar: undefined,
      time: '2026-05-22 09:15',
      preview: '**优化**技巧：减少不必要的渲染、使用 useMemo 和 useCallback...',
    });
  }

  // Files
  if (q.includes('优化') || q.includes('button') || q.includes('react')) {
    results.push({
      type: 'file',
      id: 'file-1',
      title: 'Button.tsx',
      subtitle: 'src/components/ui/',
      time: '3天前 · 2.3KB · TypeScript',
      preview: 'function handle**Optimize**() {\n  const result = **optimize**(data);\n  return result;\n}',
    });
    results.push({
      type: 'file',
      id: 'file-2',
      title: 'utils.ts',
      subtitle: 'src/utils/',
      time: '1周前 · 1.2KB · TypeScript',
      preview: 'export const **optimize** = (data: any) => { ... }',
    });
    results.push({
      type: 'file',
      id: 'file-3',
      title: 'SearchPage.tsx',
      subtitle: 'src/pages/',
      time: '2天前 · 4.5KB · TypeScript',
      preview: '// TODO: **优化**搜索性能，使用 debounce...',
    });
  }

  // Contacts
  if (q.includes('张') || q.includes('李') || q.includes('王')) {
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
    results.push({
      type: 'contact',
      id: 'contact-3',
      title: '王五',
      subtitle: '全栈工程师',
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
      preview: '10  │ function handleClick() {\n11  │   const result = **optimize**(data);\n12  │   return result;\n13  │ }',
    });
    results.push({
      type: 'code',
      id: 'code-2',
      title: 'performance.ts',
      subtitle: 'src/utils/performance.ts :15',
      preview: '15  │ export function **optimize**Performance() {\n16  │   // measure and improve\n17  │ }',
    });
  }

  return results;
};

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const [query] = useState(initialQuery);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortType, setSortType] = useState<SortType>('relevance');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const found = mockSearch(query);
    setResults(found);
  }, [query]);

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

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'contact':
        navigate(`/chat/${result.id}`);
        break;
      case 'chat':
        navigate(`/chat/${result.id}`);
        break;
      case 'message':
        navigate(`/chat/general`);
        break;
      case 'file':
        navigate(`/files?highlight=${encodeURIComponent(query)}`);
        break;
      case 'code':
        navigate(`/files?line=42`);
        break;
    }
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / itemsPerPage));
  const paginatedResults = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 p-4 max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/search')}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            ←
          </button>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-slate-400">🔍</span>
            <span className="font-medium text-slate-900 dark:text-white">{query}</span>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            ✏️
          </button>
        </div>

        {/* Meta Info */}
        <div className="px-4 pb-3 max-w-4xl mx-auto text-sm text-slate-500">
          找到 {filteredResults.length} 条结果，搜索耗时 0.12s
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 px-4 pb-3 overflow-x-auto max-w-4xl mx-auto">
          {(['all', 'messages', 'files', 'contacts', 'code'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
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

        {/* Advanced Filters Toggle */}
        <div className="px-4 pb-3 max-w-4xl mx-auto">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-slate-500 hover:text-blue-500 flex items-center gap-1"
          >
            高级筛选 {showAdvancedFilters ? '▲' : '▼'}
          </button>
        </div>
      </header>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex flex-wrap gap-4">
              {/* Date Range */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">时间范围</label>
                <div className="flex gap-2">
                  {['最近', '本周', '本月', '今年'].map((range) => (
                    <button
                      key={range}
                      className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">排序</label>
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value as SortType)}
                  className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 rounded border-none outline-none"
                >
                  <option value="relevance">相关性</option>
                  <option value="time-desc">最新优先</option>
                  <option value="time-asc">最早优先</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4">
          {filteredResults.length === 0 ? (
            /* Empty State */
            <EmptyState
              icon="🔍"
              title="未找到相关结果"
              description="试试以下方法：检查拼写是否正确，尝试使用更通用的关键词，减少筛选条件"
              action={
                <button
                  onClick={() => navigate('/search')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  重新搜索
                </button>
              }
            />
          ) : (
            <div className="space-y-8">
              {/* Messages Section */}
              {groupedResults.messages.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      💬 聊天消息 <span className="text-slate-400">({groupedResults.messages.length} 条)</span>
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {groupedResults.messages.slice(0, 3).map((result) => (
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
                              <p className="text-sm text-slate-600 dark:text-slate-400">{result.subtitle}</p>
                            )}
                            {result.preview && (
                              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 line-clamp-2">{result.preview}</p>
                            )}
                            <button className="text-xs text-blue-500 mt-2 hover:underline">跳转到 →</button>
                          </div>
                        </div>
                      </button>
                    ))}
                    {groupedResults.messages.length > 3 && (
                      <button className="w-full py-3 text-sm text-slate-500 hover:text-blue-500 text-center">
                        加载更多消息 ({groupedResults.messages.length - 3} 条)
                      </button>
                    )}
                  </div>
                </section>
              )}

              {/* Files Section */}
              {groupedResults.files.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      📄 文件 <span className="text-slate-400">({groupedResults.files.length} 个)</span>
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {groupedResults.files.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                            📄
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-slate-900 dark:text-white">{result.title}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">{result.subtitle}</p>
                            {result.time && (
                              <p className="text-xs text-slate-400">{result.time}</p>
                            )}
                            {result.preview && (
                              <pre className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-900 p-2 rounded overflow-x-auto">
                                {result.preview}
                              </pre>
                            )}
                            <div className="flex gap-2 mt-2">
                              <button className="px-3 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50">
                                预览
                              </button>
                              <button className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600">
                                下载
                              </button>
                            </div>
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      👤 联系人 <span className="text-slate-400">({groupedResults.contacts.length} 位)</span>
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {groupedResults.contacts.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow flex items-center gap-4"
                      >
                        <Avatar name={result.title} src={result.avatar} size="lg" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-slate-900 dark:text-white">{result.title}</p>
                          {result.subtitle && (
                            <p className="text-sm text-slate-500">{result.subtitle}</p>
                          )}
                        </div>
                        <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                          发起聊天 →
                        </button>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Code Section */}
              {groupedResults.code.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      📝 代码 <span className="text-slate-400">({groupedResults.code.length} 处)</span>
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {groupedResults.code.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                            📝
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white">{result.title}</p>
                            <p className="text-xs text-slate-500 mb-2">{result.subtitle}</p>
                            {result.preview && (
                              <pre className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-900 p-3 rounded overflow-x-auto font-mono">
                                {result.preview}
                              </pre>
                            )}
                            <button className="text-xs text-blue-500 mt-2 hover:underline">跳转到 :42 →</button>
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
      </div>

      {/* Pagination */}
      {filteredResults.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              ← 上一页
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-slate-400">...</span>}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              下一页 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}