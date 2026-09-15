export default function ResidentPortalLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Title Header */}
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-4 w-96 rounded bg-slate-100 animate-pulse" />
      </div>

      {/* Active Lease Hero Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 rounded-full bg-emerald-100/60 animate-pulse" />
            <div className="h-10 w-32 rounded-xl bg-slate-900/80 animate-pulse" />
          </div>
        </div>

        {/* Lease Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-slate-50 p-4 space-y-2">
              <div className="h-3.5 w-20 rounded bg-slate-200" />
              <div className="h-6 w-28 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-xs"
          >
            <div className="h-12 w-12 rounded-xl bg-slate-100 animate-pulse shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-5 w-32 rounded bg-slate-200 animate-pulse" />
              <div className="h-3.5 w-40 rounded bg-slate-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Tenancy & Payment History Table Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-40 rounded bg-slate-200 animate-pulse" />
          <div className="h-8 w-28 rounded-lg bg-slate-100 animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-200" />
                <div className="space-y-1">
                  <div className="h-4 w-36 rounded bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
              </div>
              <div className="h-5 w-24 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
