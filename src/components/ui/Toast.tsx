import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const ToastViewport: React.FC = () => {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 right-4 z-50 flex w-full max-w-sm flex-col gap-2 md:bottom-6"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.tone === 'success'
            ? CheckCircle2
            : toast.tone === 'warning' || toast.tone === 'error'
              ? AlertCircle
              : Info;
        const toneClasses =
          toast.tone === 'success'
            ? 'border-emerald-200 bg-white dark:border-emerald-800 dark:bg-slate-900 text-emerald-700 dark:text-emerald-300'
            : toast.tone === 'warning'
              ? 'border-amber-200 bg-white dark:border-amber-800 dark:bg-slate-900 text-amber-700 dark:text-amber-300'
              : toast.tone === 'error'
                ? 'border-rose-200 bg-white dark:border-rose-800 dark:bg-slate-900 text-rose-700 dark:text-rose-300'
                : 'border-blue-200 bg-white dark:border-blue-800 dark:bg-slate-900 text-blue-700 dark:text-blue-300';

        return (
          <div
            key={toast.id}
            role="status"
            className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg ${toneClasses}`}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
