// Component: C06 Badge — 徽章/计数
interface BadgeProps {
  count?: number;
  label?: string;
  variant?: 'default' | 'blue' | 'green' | 'red' | 'yellow';
  max?: number;
}

export function Badge({ count, label, variant = 'default', max = 99 }: BadgeProps) {
  const display =
    count !== undefined ? (count > max ? `${max}+` : String(count)) : undefined;

  const variantClasses: Record<string, string> = {
    default: 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300',
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    red: 'bg-red-500 text-white',
    yellow: 'bg-yellow-500 text-yellow-900',
  };

  const cls = variantClasses[variant];

  if (label !== undefined) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
        {label}
      </span>
    );
  }

  if (display !== undefined && Number(display) > 0) {
    return (
      <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium ${cls}`}>
        {display}
      </span>
    );
  }

  return null;
}