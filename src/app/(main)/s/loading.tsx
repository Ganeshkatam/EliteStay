export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Search Filter Toolbar Skeleton */}
      <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-10 w-44 rounded-full bg-slate-100 animate-pulse border border-slate-200/60" />
            <div className="h-10 w-28 rounded-full bg-slate-100 animate-pulse border border-slate-200/60" />
            <div className="h-10 w-32 rounded-full bg-slate-100 animate-pulse border border-slate-200/60" />
            <div className="h-10 w-28 rounded-full bg-slate-100 animate-pulse border border-slate-200/60 hidden sm:block" />
          </div>

          {/* View Mode & Sort Toggle */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-36 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-10 w-24 rounded-xl bg-slate-100 animate-pulse hidden md:block" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Results Header Counter Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 w-52 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-4 w-36 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="h-8 w-28 rounded-lg bg-slate-100 animate-pulse hidden sm:block" />
        </div>

        {/* Listings Grid + Map Split */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Listing Cards Grid */}
          <div className="lg:col-span-12 xl:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="group rounded-2xl border border-slate-200/70 bg-white p-3 shadow-xs space-y-3"
                >
                  {/* Image Carousel Skeleton */}
                  <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-200/80 animate-pulse">
                    <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/70" />
                    <div className="absolute bottom-3 left-3 h-6 w-20 rounded-full bg-slate-900/20" />
                  </div>

                  {/* Property Details Skeleton */}
                  <div className="space-y-2 px-1 pb-1">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-3/5 rounded bg-slate-200 animate-pulse" />
                      <div className="h-4 w-12 rounded bg-slate-100 animate-pulse" />
                    </div>
                    <div className="h-4 w-4/5 rounded bg-slate-100 animate-pulse" />

                    {/* Features Badges */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="h-5 w-16 rounded-md bg-slate-100 animate-pulse" />
                      <div className="h-5 w-16 rounded-md bg-slate-100 animate-pulse" />
                      <div className="h-5 w-16 rounded-md bg-slate-100 animate-pulse" />
                    </div>

                    {/* Price Skeleton */}
                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                      <div className="h-6 w-28 rounded bg-slate-200 animate-pulse" />
                      <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Preview Placeholder for Large Screens */}
          <div className="hidden xl:block xl:col-span-4">
            <div className="sticky top-20 h-[calc(100vh-6rem)] rounded-2xl border border-slate-200/80 bg-slate-100 p-4 animate-pulse flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-8 w-24 rounded-lg bg-slate-200" />
                <div className="h-8 w-8 rounded-lg bg-slate-200" />
              </div>
              <div className="space-y-3 flex flex-col items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="h-4 w-32 rounded bg-slate-200" />
              </div>
              <div className="flex justify-end gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-200" />
                <div className="h-8 w-8 rounded-lg bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
