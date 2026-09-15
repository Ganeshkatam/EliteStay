'use client';

import { RefreshCw, X } from 'lucide-react';
import {
  useInactivityRefresh,
  UseInactivityRefreshOptions,
} from '@/hooks/useInactivityRefresh';

export type InactivityRefreshProps = UseInactivityRefreshOptions;

/**
 * InactivityRefresh
 *
 * Client notification component that monitors user inactivity without disrupting
 * active reading or viewing. When inactivity exceeds the threshold (default: 30 min),
 * it displays an elegant, non-intrusive floating toast notifying the user that newer
 * data is available, with an explicit action to refresh.
 */
export function InactivityRefresh(props: InactivityRefreshProps) {
  const { needsRefresh, isRefreshing, refresh, dismiss } =
    useInactivityRefresh(props);

  if (!needsRefresh) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      aria-label="Page update notification"
      className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-neutral-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 dark:border-neutral-800/80 dark:bg-neutral-900/95"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </div>

        <div className="flex-1 pr-1">
          <h4 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Updates Available
          </h4>
          <p className="mt-0.5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            You have been away for a while. Refresh to get the latest
            availability and pricing.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <RefreshCw
                className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              {isRefreshing ? 'Refreshing...' : 'Refresh Page'}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Close notification"
          className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
