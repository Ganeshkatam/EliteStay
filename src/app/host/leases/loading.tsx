export default function HostLeasesLoading() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-slate-200" />
        <div className="h-4 w-96 rounded bg-slate-100" />
      </div>

      {/* Leases Workspace Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="h-6 w-20 rounded-full bg-slate-100" />
            </div>

            <div className="space-y-2 border-y border-slate-100 py-3">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-slate-100" />
                <div className="h-4 w-28 rounded bg-slate-200" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded bg-slate-100" />
                <div className="h-4 w-20 rounded bg-slate-200" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="h-9 w-28 rounded-xl bg-slate-100" />
              <div className="h-9 w-24 rounded-xl bg-slate-900/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
