export default function ObservabilityLoading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-slate-200" />
        <div className="h-4 w-96 rounded bg-slate-100" />
      </div>

      {/* Telemetry Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs"
          >
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="h-8 w-20 rounded bg-slate-200" />
            <div className="h-3.5 w-36 rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Trace Waterfall & Events Log Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="h-6 w-44 rounded bg-slate-200" />
          <div className="h-8 w-24 rounded-lg bg-slate-100" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 rounded bg-slate-200" />
                <div className="h-4 w-48 rounded bg-slate-200" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-20 rounded bg-slate-100" />
                <div className="h-4 w-16 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
