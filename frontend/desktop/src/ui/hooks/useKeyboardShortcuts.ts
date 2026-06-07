// Hook: useKeyboardShortcuts
// Global keyboard shortcuts for AIIM desktop app
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

const isInputElement = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || target.isContentEditable;
};

export const useGlobalShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      if (isInputElement(e.target)) return;

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase() ||
                         e.code.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrl === (e.ctrlKey || e.metaKey);
        const shiftMatch = !!shortcut.shift === e.shiftKey;
        const altMatch = !!shortcut.alt === e.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
};

// Pre-defined shortcut sets
export const useChatShortcuts = (opts: {
  onSearch?: () => void;
  onNewChat?: () => void;
  onSettings?: () => void;
  onEsc?: () => void;
}) => {
  const navigate = useNavigate();

  const shortcuts: Shortcut[] = [
    {
      key: 'k',
      ctrl: true,
      action: () => navigate('/search'),
      description: '打开全局搜索',
    },
    {
      key: 'n',
      ctrl: true,
      action: () => navigate('/home'),
      description: '新建聊天',
    },
    {
      key: ',',
      ctrl: true,
      action: () => navigate('/settings'),
      description: '打开设置',
    },
    {
      key: 'Escape',
      action: () => opts.onEsc?.(),
      description: '关闭弹窗/侧边栏',
    },
    {
      key: 'l',
      ctrl: true,
      action: () => opts.onEsc?.(),
      description: '滚动到最新消息',
    },
  ];

  useGlobalShortcuts(shortcuts);
};

// Shortcut registry for reference
export const SHORTCUT_DESCRIPTIONS: Record<string, string> = {
  'Ctrl+K': '打开全局搜索',
  'Ctrl+N': '新建聊天',
  'Ctrl+,': '打开设置',
  'Escape': '关闭弹窗/侧边栏',
  'Ctrl+L': '滚动到最新消息',
  'Ctrl+Enter': '发送消息（输入框内）',
  '↑/↓': '切换历史输入（输入框内）',
  'Ctrl+1/2/3': '切换主 Tab',
  'Ctrl+F': '页面内搜索',
};