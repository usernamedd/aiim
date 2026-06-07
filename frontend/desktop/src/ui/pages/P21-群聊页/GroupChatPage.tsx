// Page: P21 群聊页
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { useAuthStore } from '../../../infrastructure/stores/auth-store';
import { Avatar } from '../../components/C05-Avatar/Avatar';
import { Button } from '../../components/C07-Button/Button';
import { Input } from '../../components/C08-Input/Input';
import { MessageBubble } from '../../components/C13-MessageBubble/MessageBubble';
import { Spinner } from '../../components/C12-Loading/Loading';

export function GroupChatPage() {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const navigate = useNavigate();
  const { messages, loadMessages, sendMessage, isLoadingMessages, chatRooms, setCurrentChatRoom } = useChat();
  const { user } = useAuthStore();
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{ name: string; data: string; type: 'image' | 'file' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chatRoom = chatRooms.find((r) => r.id === chatRoomId);

  useEffect(() => {
    if (chatRoomId) {
      setCurrentChatRoom(chatRoomId);
      loadMessages(chatRoomId);
    }
  }, [chatRoomId, loadMessages, setCurrentChatRoom]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPendingAttachment({ name: file.name, data: ev.target?.result as string, type: 'image' });
      };
      reader.readAsDataURL(file);
    } else {
      setPendingAttachment({ name: file.name, data: file.name, type: 'file' });
    }
    e.target.value = '';
  };

  const handleSend = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      if (pendingAttachment) {
        await sendMessage(pendingAttachment.data, pendingAttachment.type);
        setPendingAttachment(null);
      }
      if (inputValue.trim()) {
        await sendMessage(inputValue.trim(), 'text');
      }
      setInputValue('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>←</Button>
          <Avatar name={chatRoom?.name || 'Group'} size="sm" />
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {chatRoom?.name || chatRoomId || '群聊'}
            </h2>
            <p className="text-xs text-slate-500">
              {chatRoom?.memberIds.length || 0} 位成员
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowMembers(!showMembers)}>
            👥
          </Button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="md" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>群聊暂无消息</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === (user?.id || 'current-user')}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Attachment Preview */}
        {pendingAttachment && (
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
            {pendingAttachment.type === 'image' ? (
              <img src={pendingAttachment.data} alt="attachment" className="h-12 w-12 object-cover rounded-lg" />
            ) : (
              <span className="text-2xl">📎</span>
            )}
            <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{pendingAttachment.name}</span>
            <button onClick={() => setPendingAttachment(null)} className="text-slate-400 hover:text-red-500 text-sm">✕</button>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-end gap-2">
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt,.md,.zip,.rar" className="hidden" onChange={handleFileSelect} />
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="添加附件">📎</button>
            <div className="flex-1">
              <Input
                placeholder="输入群消息..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSend}
              isLoading={isSending}
              disabled={!inputValue.trim() && !pendingAttachment}
            >
              发送
            </Button>
          </div>
        </div>
      </div>

      {/* Members Panel */}
      {showMembers && (
        <aside className="w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">群成员</h3>
          <div className="space-y-3">
            {chatRoom?.memberIds.map((memberId) => (
              <div key={memberId} className="flex items-center gap-2">
                <Avatar name={memberId} size="sm" isOnline />
                <span className="text-sm text-slate-700 dark:text-slate-300">{memberId}</span>
              </div>
            )) || (
              <p className="text-sm text-slate-400">暂无成员信息</p>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
