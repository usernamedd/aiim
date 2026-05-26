// Page: P10 主聊列表页
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { Avatar } from '../../components/C05-Avatar/Avatar';
import { Button } from '../../components/C07-Button/Button';
import { ChatRoomSkeleton } from '../../components/C12-Loading/Loading';
import { useAuthStore } from '../../../infrastructure/stores/auth-store';

export function HomePage() {
  const navigate = useNavigate();
  const { chatRooms, loadChatRooms, isWsConnected } = useChat();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    loadChatRooms();
  }, [loadChatRooms]);

  const handleChatClick = (chatRoomId: string, type: 'private' | 'group') => {
    const path = type === 'group' ? `/group/${chatRoomId}` : `/chat/${chatRoomId}`;
    navigate(path);
  };

  const handleNewChat = async () => {
    // For mock: just navigate to a new chat room
    navigate('/chat/new-private-chat');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AIIM</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>🔍</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/files')}>📁</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>📊</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/contacts')}>👥</Button>
              <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>⚙️</Button>
            </div>
          </div>
          <Button variant="primary" size="md" className="w-full" onClick={handleNewChat}>
            + 新建聊天
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chatRooms.length === 0 ? (
            <div className="p-4 space-y-2">
              <ChatRoomSkeleton />
              <ChatRoomSkeleton />
              <ChatRoomSkeleton />
            </div>
          ) : (
            chatRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleChatClick(room.id, room.type)}
                className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50"
              >
                <Avatar name={room.name} src={room.avatar} size="md" />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 dark:text-white truncate">
                      {room.name}
                    </span>
                    {room.lastMessageTime && (
                      <span className="text-xs text-slate-400">
                        {new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(room.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {room.lastMessagePreview || (room.type === 'group' ? '群聊' : '私聊')}
                  </p>
                </div>
                {room.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {room.unreadCount > 99 ? '99+' : room.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Avatar name={user?.nickname || user?.username || 'User'} src={user?.avatar} size="sm" isOnline />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.nickname || user?.username}
              </p>
              <p className="text-xs text-slate-500">在线</p>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>退出</Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            欢迎使用 AIIM
          </h2>
          <p className="text-slate-500 mb-6">选择一个聊天或开始新的对话</p>
          <Button variant="secondary" onClick={handleNewChat}>发起新聊天</Button>
        </div>
      </main>
    </div>
  );
}
