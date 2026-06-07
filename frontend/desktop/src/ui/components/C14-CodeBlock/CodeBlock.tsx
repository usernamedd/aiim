// Component: C14 CodeBlock — 代码块（独立版本，支持多语言）
import { useState, useRef, useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  showCopy?: boolean;
  maxHeight?: string;
}

export function CodeBlock({
  code,
  language,
  showLineNumbers = false,
  showCopy = true,
  maxHeight,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && language) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');
  const isLong = lines.length > 20;

  const codeContent = (
    <div className="relative group">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-1 bg-slate-800 rounded-t-lg border-b border-slate-700">
        <span className="text-xs text-slate-400">{language || 'code'}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {showCopy && (
            <button
              onClick={handleCopy}
              className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-xs"
              title="复制"
            >
              {copied ? '✅' : '📋'}
            </button>
          )}
          {isLong && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-xs"
              title={isCollapsed ? '展开' : '折叠'}
            >
              {isCollapsed ? '⬇️' : '⬆️'}
            </button>
          )}
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-xs"
            title="全屏"
          >
            ⤢
          </button>
        </div>
      </div>

      {/* Code */}
      <pre
        className="bg-slate-800 rounded-lg pt-8 pb-4 px-4 overflow-x-auto text-sm"
        style={{ maxHeight: isCollapsed ? '200px' : maxHeight }}
      >
        <code ref={codeRef} className={language ? `language-${language}` : ''}>
          {showLineNumbers
            ? lines.map((line, i) => (
                <span key={i} className="flex">
                  <span className="select-none text-slate-500 w-8 text-right mr-4">{i + 1}</span>
                  <span>{line}</span>
                </span>
              ))
            : code}
        </code>
      </pre>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8" onClick={() => setIsFullscreen(false)}>
        <div className="bg-slate-900 rounded-xl w-full max-w-5xl max-h-full overflow-auto">
          <div className="sticky top-0 bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700">
            <span className="text-slate-300 text-sm">{language}</span>
            <button className="text-slate-400 hover:text-white text-xl">✕</button>
          </div>
          <pre className="p-4 text-sm text-slate-100 overflow-x-auto">{code}</pre>
        </div>
      </div>
    );
  }

  return codeContent;
}