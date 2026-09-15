export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Settings Section Header */}
      <div className="space-y-2 border-b border-slate-100 pb-4">
        <div className="h-7 w-44 rounded-lg bg-slate-200" />
        <div className="h-4 w-72 rounded bg-slate-100" />
      </div>

      {/* Settings Option Cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/70 bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
          >
            <div className="space-y-1.5 flex-1">
              <div className="h-5 w-48 rounded bg-slate-200" />
              <div className="h-4 w-4/5 rounded bg-slate-100" />
            </div>
            <div className="h-6 w-12 rounded-full bg-slate-200 shrink-0" />
          </div>
        ))}
      </div>

      {/* Form Fields Section */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-6 space-y-6 shadow-xs">
        <div className="h-5 w-36 rounded bg-slate-200" />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-11 rounded-xl bg-slate-50 border border-slate-200/50" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-11 rounded-xl bg-slate-50 border border-slate-200/50" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <div className="h-10 w-28 rounded-xl bg-slate-900/80" />
        </div>
      </div>
    </div>
  );
}
