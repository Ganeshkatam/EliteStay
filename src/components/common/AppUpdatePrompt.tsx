'use client';

import { useAppUpdate } from '@/hooks/useAppUpdate';
import { Sparkles, RefreshCw, X } from 'lucide-react';

export function AppUpdatePrompt() {
  const { updateAvailable, applyUpdate, dismiss } = useAppUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      aria-label="Application update notification"
      className="fixed bottom-6 left-6 z-50 max-w-sm rounded-2xl border border-slate-700/80 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <Sparkles className="h-5 w-5" />
        </div>

        <div className="flex-1 pr-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold tracking-tight text-white">
              Update Available
            </h4>
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
              New
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            A new version of EliteStay has been deployed. Refresh to get the
            latest features and improvements.
          </p>

          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={applyUpdate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-900 shadow-md transition-all hover:bg-slate-100 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Update Now</span>
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-xl px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Later
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Close update notification"
          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
