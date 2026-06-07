// Component: C02 SearchBar — 搜索框
import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = '搜索...',
  value: controlledValue,
  onChange,
  onSearch,
  autoFocus,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (controlledValue === undefined) setInternalValue(v);
    onChange?.(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch?.(value);
  };

  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-slate-400">🔍</span>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
      />
      {value && (
        <button
          onClick={() => {
            if (controlledValue === undefined) setInternalValue('');
            onChange?.('');
          }}
          className="absolute right-3 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}