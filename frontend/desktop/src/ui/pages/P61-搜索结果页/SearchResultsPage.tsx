// Page: P61 搜索结果页 (dedicated results page, uses same logic as P60)
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Input } from '../../components/C08-Input/Input';
import { Button } from '../../components/C07-Button/Button';
import { Avatar } from '../../components/C05-Avatar/Avatar';
import { useChat } from '../../hooks/useChat';
import type { Contact } from '../../../domain/entities/Contact';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const { contacts, chatRooms, messages } = useChat();
  const [query, setQuery] = useState(initialQuery);

  const [results, setResults] = useState<Array<{
    type: 'contact' | 'chat' | 'message';
    id: string;
    title: string;
    subtitle?: string;
    avatar?: string;
  }>>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const found: typeof results = [];

    contacts.forEach((c: Contact) => {
      if (c.username.toLowerCase().includes(q) || c.nickname.toLowerCase().includes(q)) {
        found.push({ type: 'contact', id: c.id, title: c.nickname, subtitle: `@${c.username}`, avatar: c.avatar });
      }
    });
    chatRooms.forEach((r) => {
      if (r.name.toLowerCase().includes(q)) {
        found.push({ type: 'chat', id: r.id, title: r.name, subtitle: r.type === 'group' ? '群聊' : '私聊', avatar: r.avatar });
      }
    });
    messages.forEach((m) => {
      if (m.content.toLowerCase().includes(q)) {
        found.push({ type: 'message', id: m.id, title: m.content.slice(0, 60), subtitle: `来自: ${m.senderId}` });
      }
    });
    setResults(found);
  }, [query, contacts, chatRooms, messages]);

  const handleResultClick = (result: typeof results[0]) => {
    if (result.type === 'contact') navigate(`/chat/${result.id}`);
    else if (result.type === 'chat') {
      const room = chatRooms.find((r) => r.id === result.id);
      navigate(room?.type === 'group' ? `/group/${result.id}` : `/chat/${result.id}`);
    } else {
      const msg = messages.find((m) => m.id === result.id);
      if (msg) navigate(`/chat/${msg.chatRoomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>←</Button>
          <div className="flex-1">
            <Input
              placeholder="搜索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {results.length === 0 && query ? (
          <div className="text-center text-slate-400 py-8">
            <p>未找到 "{query}" 相关结果</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <p>输入关键词搜索</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-slate-400 px-2 mb-2">{results.length} 个结果</p>
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="w-full p-3 flex items-center gap-3 rounded-lg hover:bg-white dark:hover:bg-slate-800"
              >
                <Avatar name={result.title} src={result.avatar} size="sm" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{result.title}</p>
                  {result.subtitle && <p className="text-xs text-slate-500">{result.subtitle}</p>}
                </div>
                <span className="text-xs text-slate-400">{result.type === 'contact' ? '联系人' : result.type === 'chat' ? '聊天' : '消息'}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
