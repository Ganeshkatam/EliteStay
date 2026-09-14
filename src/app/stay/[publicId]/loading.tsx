export default function StayLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Stay Hero Status Banner */}
        <div className="rounded-3xl bg-slate-900 p-6 md:p-8 text-white space-y-4 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded-full bg-white/20" />
              <div className="h-8 w-64 md:w-80 rounded-lg bg-white/30" />
              <div className="h-4 w-48 rounded bg-white/20" />
            </div>
            <div className="h-12 w-36 rounded-xl bg-white/20 shrink-0" />
          </div>
        </div>

        {/* Quick Access Utility Cards (Key, WiFi, Host, Location) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-xs"
            >
              <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
              <div className="h-6 w-36 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>

        {/* House Manual & Essential Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="h-6 w-44 rounded bg-slate-200 animate-pulse" />
              <div className="space-y-3">
                <div className="h-16 rounded-xl bg-slate-50 border border-slate-100 p-4" />
                <div className="h-16 rounded-xl bg-slate-50 border border-slate-100 p-4" />
                <div className="h-16 rounded-xl bg-slate-50 border border-slate-100 p-4" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="h-6 w-36 rounded bg-slate-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Side Support Card */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="h-5 w-32 rounded bg-slate-200 animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
                  <div className="h-3.5 w-20 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
              <div className="h-10 w-full rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
