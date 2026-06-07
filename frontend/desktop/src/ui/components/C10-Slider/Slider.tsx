// Component: C10 Slider — 滑动条
interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled,
  label,
  showValue,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between mb-2">
          {label && <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>}
          {showValue && <span className="text-sm text-slate-500">{value}</span>}
        </div>
      )}
      <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
        <div
          className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <span
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow border-2 border-blue-500"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
    </div>
  );
}