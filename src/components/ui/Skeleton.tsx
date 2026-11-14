import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`}
  />
);

export const CardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-20 w-full" />
  </div>
);
