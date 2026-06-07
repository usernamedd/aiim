// Component: C04 Dialog — 对话框/确认框
import { useEffect, useRef } from 'react';
import { Button } from '../C07-Button/Button';

interface DialogProps {
  open: boolean;
  title: string;
  message?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'danger';
}

export function Dialog({
  open,
  title,
  message,
  children,
  confirmLabel = '确认',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
  variant = 'default',
}: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel?.();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onCancel?.()}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          {message && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>}
          {children && <div className="mt-4">{children}</div>}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" size="md" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}