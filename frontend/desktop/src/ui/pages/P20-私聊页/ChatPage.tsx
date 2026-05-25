// Page: P20 私聊页
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { useAuthStore } from '../../../infrastructure/stores/auth-store';
import { Avatar } from '../../components/C05-Avatar/Avatar';
import { Button } from '../../components/C07-Button/Button';
import { Input } from '../../components/C08-Input/Input';
import { MessageBubble } from '../../components/C13-MessageBubble/MessageBubble';
import { Spinner } from '../../components/C12-Loading/Loading';

export function ChatPage() {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const navigate = useNavigate();
  const { messages, loadMessages, sendMessage, isLoadingMessages, chatRooms } = useChat();
  const { user } = useAuthStore();
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatRoom = chatRooms.find((r) => r.id === chatRoomId);

  useEffect(() => {
    if (chatRoomId) {
      loadMessages(chatRoomId);
    }
  }, [chatRoomId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(inputValue.trim());
      setInputValue('');
      inputRef.current?.focus();
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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>←</Button>
        <Avatar name={chatRoom?.name || 'Chat'} size="sm" />
        <div className="flex-1">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {chatRoom?.name || chatRoomId || '私聊'}
          </h2>
          {chatRoom && (
            <p className="text-xs text-slate-500">{chatRoom.memberIds.length} 位成员</p>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>暂无消息，开始对话吧</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === (user?.id || 'current-user')}
              senderName={msg.senderId === (user?.id || 'current-user') ? undefined : chatRoom?.name}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              ref={inputRef}
              placeholder="输入消息..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSend}
            isLoading={isSending}
            disabled={!inputValue.trim()}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}
