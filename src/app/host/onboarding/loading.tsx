export default function HostOnboardingLoading() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 space-y-8 animate-pulse">
      {/* Stepper Progress Bar Skeleton */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200" />
            <div className="h-4 w-20 rounded bg-slate-100 hidden sm:block" />
          </div>
        ))}
      </div>

      {/* Form Card Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="space-y-2">
          <div className="h-7 w-52 rounded-lg bg-slate-200" />
          <div className="h-4 w-80 rounded bg-slate-100" />
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="h-12 rounded-xl bg-slate-50 border border-slate-200/60" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-slate-200" />
            <div className="h-12 rounded-xl bg-slate-50 border border-slate-200/60" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-24 rounded-xl bg-slate-50 border border-slate-200/60" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div className="h-11 w-24 rounded-xl bg-slate-100" />
          <div className="h-11 w-32 rounded-xl bg-slate-900/80" />
        </div>
      </div>
    </div>
  );
}
