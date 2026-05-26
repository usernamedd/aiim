// Page: P33 AI 助手页
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar } from '../../components/C05-Avatar/Avatar';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedFiles?: RelatedFile[];
}

interface RelatedFile {
  name: string;
  path: string;
  icon: string;
}

interface CodeBlock {
  language: string;
  code: string;
}

// Mock data
const mockRelatedFiles: RelatedFile[] = [
  { name: 'helper.ts', path: 'src/utils/helper.ts', icon: '📄' },
  { name: 'index.ts', path: 'src/types/index.ts', icon: '📄' },
];

const mockSuggestedQuestions = [
  '如何处理异步错误？',
  '解释这段代码的逻辑',
  '有哪些优化建议？',
];

const mockAIResponse: Message = {
  id: 'ai-1',
  role: 'assistant',
  content: `这是一个很好的问题！可以通过以下方式优化：

1. **使用备忘录模式** - 缓存已计算的结果，避免重复计算
2. **惰性求值** - 仅在真正需要时计算
3. **使用 Web Worker** - 将耗时计算移至后台线程

\`\`\`typescript
// 优化后的代码示例
function memoizedFn<T>(
  fn: () => T,
  cache: Map<string, T> = new Map()
): () => T {
  let computed = false;
  let result: T;
  
  return () => {
    if (!computed) {
      result = fn();
      computed = true;
    }
    return result;
  };
}
\`\`\`

这种方法可以将时间复杂度从 O(n²) 降低到 O(n)。`,
  timestamp: new Date(),
  relatedFiles: mockRelatedFiles,
};

// Components
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <Avatar name="AI" size="xs" />
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function CodeBlock({
  code,
  language,
  onCopy,
}: {
  code: string;
  language: string;
  onCopy: () => void;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const codeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    onCopy();
  };

  const codeContent = (
    <div className="relative group">
      <div className="absolute top-2 left-3 text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
        {language}
      </div>
      <pre className="bg-slate-800 rounded-lg p-4 pt-8 overflow-x-auto text-sm">
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-xs"
          title="复制代码"
        >
          📋
        </button>
        <button
          onClick={() => setIsFullscreen(true)}
          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-xs"
          title="全屏"
        >
          ⤢
        </button>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
        <div className="bg-slate-900 rounded-xl w-full max-w-4xl max-h-full overflow-auto">
          <div className="sticky top-0 bg-slate-800 p-3 flex justify-between items-center">
            <span className="text-slate-300 text-sm">{language}</span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="text-slate-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
          <pre className="p-4 text-sm text-slate-100 overflow-x-auto">
            <code className={`language-${language}`}>{code}</code>
          </pre>
        </div>
      </div>
    );
  }

  return codeContent;
}

function AIMessage({
  message,
  onThumbsUp,
  onThumbsDown,
  onRegenerate,
}: {
  message: Message;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
  onRegenerate: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse content to separate code blocks from text
  const contentParts = message.content.split(/(```\w+?\n[\s\S]*?```)/g);

  return (
    <div className="flex gap-3 px-4 py-3">
      <Avatar name="AI" size="sm" />
      <div className="flex-1 space-y-3">
        {/* Message Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-md p-4 shadow-sm max-w-2xl">
          {contentParts.map((part, i) => {
            if (part.startsWith('```')) {
              const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
              if (match) {
                return (
                  <CodeBlock
                    key={i}
                    language={match[1] || 'plaintext'}
                    code={match[2].trim()}
                    onCopy={() => {}}
                  />
                );
              }
            }
            // Check for numbered lists and bold text
            const formatted = part
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/(\d+)\. /g, '\n$1. ');
            return <div key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
          })}
        </div>

        {/* Related Files */}
        {message.relatedFiles && message.relatedFiles.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-slate-500">📁 相关文件</span>
            <div className="space-y-1">
              {message.relatedFiles.map((file, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <span>{file.icon}</span>
                  <span>{file.name}</span>
                  <span className="text-slate-400 text-xs">{file.path}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
            title="复制全部"
          >
            {copied ? '✅' : '📋'}
          </button>
          <button
            onClick={onRegenerate}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
            title="重新生成"
          >
            🔄
          </button>
          <button
            onClick={onThumbsUp}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
            title="满意"
          >
            👍
          </button>
          <button
            onClick={onThumbsDown}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
            title="不满意"
          >
            👎
          </button>
        </div>
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: Message }) {
  return (
    <div className="flex gap-3 px-4 py-3 justify-end">
      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md p-4 max-w-xl">
        <p className="text-sm">{message.content}</p>
      </div>
      <Avatar name="User" size="sm" />
    </div>
  );
}

function ContextFileBanner({ count }: { count: number }) {
  return (
    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
          <span>📁</span>
          <span>已加载 {count} 个文件到上下文</span>
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
          查看文件
        </button>
      </div>
    </div>
  );
}

function SuggestedQuestions({
  questions,
  onSelect,
}: {
  questions: string[];
  onSelect: (q: string) => void;
}) {
  return (
    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
      <div className="max-w-4xl mx-auto">
        <span className="text-xs text-slate-500 mb-2 block">💬 试试这样问</span>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => onSelect(q)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InputBar({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  const [isCodeMode, setIsCodeMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [value]);

  return (
    <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2">
          {/* Attach Button */}
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg" title="附件">
            📎
          </button>
          
          {/* Screenshot Button */}
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg" title="截图">
            📸
          </button>

          {/* Input Area */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="问我任何关于代码的问题..."
              disabled={disabled}
              className={`w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                isCodeMode ? 'font-mono' : ''
              }`}
              rows={1}
            />
            {/* Code Mode Toggle */}
            <button
              onClick={() => setIsCodeMode(!isCodeMode)}
              className={`absolute right-3 bottom-3 px-2 py-1 text-xs rounded ${
                isCodeMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              {'</>'}
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={onSend}
            disabled={disabled || !value.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl transition-colors"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [contextFiles] = useState(3);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    scrollToBottom();

    // Simulate AI response after delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { ...mockAIResponse, id: `ai-${Date.now()}` }]);
      scrollToBottom();
    }, 1500);
  }, [inputValue]);

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleThumbsUp = () => {
    console.log('Thumbs up');
  };

  const handleThumbsDown = () => {
    console.log('Thumbs down');
  };

  const handleRegenerate = () => {
    console.log('Regenerate');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* TopBar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">AI 代码助手</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>📁</span>
            <span className="hover:text-blue-600 cursor-pointer">src/agents/planner.ts</span>
          </div>
        </div>
        <div className="flex-1" />
        <button
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          title="清除上下文"
        >
          🗑
        </button>
      </header>

      {/* ContextFileBanner */}
      <ContextFileBanner count={contextFiles} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                AI 代码助手
              </h2>
              <p className="text-slate-500">问我任何关于代码的问题</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 py-4">
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <UserMessage key={msg.id} message={msg} />
              ) : (
                <AIMessage
                  key={msg.id}
                  message={msg}
                  onThumbsUp={handleThumbsUp}
                  onThumbsDown={handleThumbsDown}
                  onRegenerate={handleRegenerate}
                />
              )
            )}
            {isTyping && <TypingIndicator />}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions - show only when there are messages */}
      {messages.length > 0 && !isTyping && (
        <SuggestedQuestions questions={mockSuggestedQuestions} onSelect={handleSuggestedQuestion} />
      )}

      {/* Input Bar */}
      <InputBar
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        disabled={isTyping}
      />
    </div>
  );
}

export default AIAssistantPage;