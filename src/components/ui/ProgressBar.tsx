import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'blue' | 'purple' | 'orange' | 'green' | 'pink';
  size?: 'sm' | 'md';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  color = 'blue',
  size = 'md',
}) => {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorMap = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-amber-500',
    green: 'bg-emerald-500',
    pink: 'bg-pink-500',
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          {label && <span className="truncate">{label}</span>}
          {showValue && <span className="tabular-nums font-mono">{pct}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className={`w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${
          size === 'sm' ? 'h-2' : 'h-2.5'
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorMap[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
