import { ContentPanel } from '@/features/dashboard/components/ContentPanel';
import { PageCanvas } from '@/features/dashboard/components/PageCanvas';

export default function ProfileLoading() {
  return (
    <ContentPanel>
      <PageCanvas>
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Overview Skeleton */}
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-0 lg:self-start">
              {/* Profile Card Skeleton */}
              <div className="flex flex-col gap-6 items-center md:items-start bg-white rounded-2xl border border-slate-200/60 p-5">
                <div className="h-24 w-24 rounded-full bg-slate-200/80 shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                </div>

                <div className="flex-1 min-w-0 w-full pt-2 flex flex-col items-center md:items-start space-y-3">
                  <div className="h-8 w-44 bg-slate-200 rounded-lg" />
                  <div className="h-4 w-32 bg-slate-100 rounded-md" />

                  {/* Completion widget skeleton */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 max-w-md w-full mt-3 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-36 bg-slate-200 rounded" />
                      <div className="h-4 w-8 bg-slate-200 rounded" />
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2" />
                    <div className="space-y-1.5 pt-1">
                      <div className="h-3 w-4/5 bg-slate-200/60 rounded" />
                      <div className="h-3 w-3/5 bg-slate-200/60 rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Section Skeleton */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-3">
                <div className="space-y-1.5">
                  <div className="h-5 w-40 bg-slate-200 rounded-md" />
                  <div className="h-3.5 w-48 bg-slate-100 rounded-md" />
                </div>
                <div className="space-y-2.5 pt-1">
                  <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl" />
                  <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Right Column: Forms Skeleton */}
            <div className="lg:col-span-8 space-y-8">
              {/* Identity Section Skeleton */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-6">
                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="h-6 w-32 bg-slate-200 rounded-md" />
                  <div className="h-4 w-52 bg-slate-100 rounded-md" />
                </div>

                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 bg-slate-200 rounded" />
                      <div className="h-11 bg-slate-50 border border-slate-200/50 rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Section Skeleton */}
              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-6">
                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="h-6 w-40 bg-slate-200 rounded-md" />
                  <div className="h-4 w-60 bg-slate-100 rounded-md" />
                </div>

                <div className="space-y-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                      <div className="h-11 bg-slate-50 border border-slate-200/50 rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageCanvas>
    </ContentPanel>
  );
}
