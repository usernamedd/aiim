// Component: MessageBubble (C13)
// Displays chat messages with text/image/file/code variants


import { Avatar } from '../C05-Avatar/Avatar';
import type { Message } from '../../../domain/entities';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
  showAvatar?: boolean;
}

const typeClasses = {
  text: '',
  image: 'max-w-64',
  file: '',
  code: '',
};

export function MessageBubble({ message, isOwn, senderName, showAvatar = true }: MessageBubbleProps) {
  const alignment = isOwn ? 'flex-row-reverse' : 'flex-row';
  const bubbleColor = isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100';
  const bubbleRadius = isOwn ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm';

  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return message.fileUrl ? (
          <img src={message.fileUrl} alt={message.fileName || 'image'} className="max-w-64 rounded-lg" />
        ) : null;
      
      case 'file':
        return (
          <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
            <span className="text-sm font-medium">{message.fileName || 'file'}</span>
            {message.fileSize && (
              <span className="text-xs opacity-70">({Math.round(message.fileSize / 1024)}KB)</span>
            )}
          </div>
        );
      
      case 'code':
        return (
          <pre className="bg-black/20 p-2 rounded-lg overflow-x-auto text-xs font-mono">
            <code>{message.content}</code>
          </pre>
        );
      
      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return (
    <div className={`flex ${alignment} gap-2 mb-2`}>
      {showAvatar && !isOwn && (
        <Avatar name={senderName || 'User'} size="sm" />
      )}
      <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {senderName && !isOwn && (
          <span className="text-xs text-gray-500 px-1">{senderName}</span>
        )}
        <div className={`px-3 py-2 ${bubbleColor} ${bubbleRadius} ${typeClasses[message.type]}`}>
          {renderContent()}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>
          {isOwn && (
            <span className="text-xs text-gray-400">
              {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : message.status === 'sent' ? '✓' : '○'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
