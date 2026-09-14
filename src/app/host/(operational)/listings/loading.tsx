export default function HostListingsLoading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-52 rounded-lg bg-slate-200" />
          <div className="h-4 w-72 rounded bg-slate-100" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-slate-200" />
      </div>

      {/* Filter / Status Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <div className="h-9 w-20 rounded-lg bg-slate-200" />
        <div className="h-9 w-24 rounded-lg bg-slate-100" />
        <div className="h-9 w-20 rounded-lg bg-slate-100" />
        <div className="h-9 w-24 rounded-lg bg-slate-100" />
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-4 shadow-xs"
          >
            <div className="aspect-16/10 rounded-xl bg-slate-200 relative overflow-hidden" />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-5 w-3/5 rounded bg-slate-200" />
                <div className="h-5 w-16 rounded-full bg-slate-100" />
              </div>
              <div className="h-4 w-2/5 rounded bg-slate-100" />
              <div className="h-5 w-28 rounded bg-slate-200 pt-1" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="h-8 w-24 rounded-lg bg-slate-100" />
              <div className="h-8 w-20 rounded-lg bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
