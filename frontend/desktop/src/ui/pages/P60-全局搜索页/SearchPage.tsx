// Page: P60 全局搜索页
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/C08-Input/Input';
import { Button } from '../../components/C07-Button/Button';
import { Avatar } from '../../components/C05-Avatar/Avatar';
import { useChat } from '../../hooks/useChat';
import type { Contact } from '../../../domain/entities/Contact';

type SearchResult = {
  type: 'contact' | 'chat' | 'message';
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
};

export function SearchPage() {
  const navigate = useNavigate();
  const { contacts, chatRooms, messages } = useChat();
    const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const found: SearchResult[] = [];

      // Search contacts
      contacts.forEach((c: Contact) => {
        if (c.username.toLowerCase().includes(q) || c.nickname.toLowerCase().includes(q)) {
          found.push({
            type: 'contact',
            id: c.id,
            title: c.nickname,
            subtitle: `@${c.username}`,
            avatar: c.avatar,
          });
        }
      });

      // Search chat rooms
      chatRooms.forEach((r) => {
        if (r.name.toLowerCase().includes(q)) {
          found.push({
            type: 'chat',
            id: r.id,
            title: r.name,
            subtitle: r.type === 'group' ? '群聊' : '私聊',
            avatar: r.avatar,
          });
        }
      });

      // Search messages (text content)
      messages.forEach((m) => {
        if (m.content.toLowerCase().includes(q)) {
          found.push({
            type: 'message',
            id: m.id,
            title: m.content.slice(0, 50),
            subtitle: `来自: ${m.senderId}`,
          });
        }
      });

      setResults(found);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, contacts, chatRooms, messages]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'contact') {
      navigate(`/chat/${result.id}`);
    } else if (result.type === 'chat') {
      const room = chatRooms.find((r) => r.id === result.id);
      if (room?.type === 'group') {
        navigate(`/group/${result.id}`);
      } else {
        navigate(`/chat/${result.id}`);
      }
    } else if (result.type === 'message') {
      // Navigate to the chat that contains this message
      const msg = messages.find((m) => m.id === result.id);
      if (msg) {
        navigate(`/chat/${msg.chatRoomId}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>←</Button>
          <div className="flex-1">
            <Input
              placeholder="搜索联系人、聊天、消息..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {isSearching ? (
          <div className="text-center text-slate-400 py-8">搜索中...</div>
        ) : results.length === 0 && query ? (
          <div className="text-center text-slate-400 py-8">
            <p>未找到 "{query}" 相关结果</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <p>输入关键词开始搜索</p>
            <p className="text-sm mt-2">支持搜索联系人、聊天名称、消息内容</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-slate-400 px-2 mb-2">找到 {results.length} 个结果</p>
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="w-full p-3 flex items-center gap-3 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <Avatar name={result.title} src={result.avatar} size="sm" />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{result.title}</p>
                  {result.subtitle && (
                    <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  result.type === 'contact' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                  result.type === 'chat' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                  {result.type === 'contact' ? '联系人' : result.type === 'chat' ? '聊天' : '消息'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
