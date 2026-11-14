import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'blue' | 'purple' | 'orange' | 'green' | 'pink' | 'red';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, tone = 'neutral', className = '' }) => {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    orange: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    pink: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300',
    red: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
};
