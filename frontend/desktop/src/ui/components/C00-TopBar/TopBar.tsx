// Component: C00 TopBar — 顶部导航栏
import { Avatar } from '../C05-Avatar/Avatar';

interface TopBarProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  actions?: React.ReactNode;
  onBack?: () => void;
}

export function TopBar({ title, subtitle, avatar, actions, onBack }: TopBarProps) {
  return (
    <header className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 flex items-center gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          ←
        </button>
      )}
      {avatar && <Avatar name={title} src={avatar} size="sm" />}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-900 dark:text-white truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}