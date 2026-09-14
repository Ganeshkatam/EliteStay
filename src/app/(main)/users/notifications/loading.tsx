import { ContentPanel } from '@/features/dashboard/components/ContentPanel';
import { PageCanvas } from '@/features/dashboard/components/PageCanvas';

export default function NotificationsLoading() {
  return (
    <ContentPanel>
      <PageCanvas>
        <div className="max-w-6xl w-full mx-auto p-4 md:p-8 pt-8 md:pt-12 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <div className="h-7 w-48 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-4 w-64 rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="h-9 w-32 rounded-xl bg-slate-100 animate-pulse" />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-9 w-28 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-9 w-24 rounded-full bg-slate-100 animate-pulse" />
          </div>

          {/* Notification Items List */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200/70 bg-white shadow-xs"
              >
                <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-48 rounded bg-slate-200 animate-pulse" />
                    <div className="h-3.5 w-16 rounded bg-slate-100 animate-pulse" />
                  </div>
                  <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageCanvas>
    </ContentPanel>
  );
}
