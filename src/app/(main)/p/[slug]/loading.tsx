export default function PropertyDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-4 rounded bg-slate-100" />
          <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-4 rounded bg-slate-100" />
          <div className="h-4 w-36 rounded bg-slate-100 animate-pulse" />
        </div>

        {/* Title & Actions Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-80 sm:w-96 rounded-lg bg-slate-200 animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="h-4 w-28 rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-44 rounded bg-slate-100 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 rounded-lg bg-slate-100 animate-pulse border border-slate-200/60" />
            <div className="h-9 w-24 rounded-lg bg-slate-100 animate-pulse border border-slate-200/60" />
          </div>
        </div>

        {/* Photo Gallery Grid Skeleton (1 Big + 4 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-72 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden bg-slate-100 p-1">
          {/* Main Hero Photo */}
          <div className="md:col-span-2 h-full rounded-xl bg-slate-200 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
          </div>
          {/* Secondary 2x2 Grid */}
          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2 h-full">
            <div className="rounded-xl bg-slate-200/90 animate-pulse" />
            <div className="rounded-xl bg-slate-200/90 animate-pulse" />
            <div className="rounded-xl bg-slate-200/80 animate-pulse" />
            <div className="rounded-xl bg-slate-200/80 animate-pulse" />
          </div>
        </div>

        {/* Two-Column Body: Details & Sticky Reservation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
          {/* Left Column: Property Info */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Host Snippet Card */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-6">
              <div className="space-y-2">
                <div className="h-6 w-48 rounded bg-slate-200 animate-pulse" />
                <div className="h-4 w-64 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="h-14 w-14 rounded-full bg-slate-200 animate-pulse" />
            </div>

            {/* Highlights List */}
            <div className="space-y-4 border-b border-slate-200/80 pb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-6 w-6 rounded-md bg-slate-200 animate-pulse shrink-0 mt-1" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
                    <div className="h-3.5 w-full max-w-md rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            {/* Description Paragraphs */}
            <div className="space-y-3 border-b border-slate-200/80 pb-6">
              <div className="h-5 w-36 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-11/12 rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-slate-100 animate-pulse" />
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4">
              <div className="h-5 w-44 rounded bg-slate-200 animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded bg-slate-200 animate-pulse" />
                    <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100 space-y-6">
              {/* Price Line */}
              <div className="flex items-baseline justify-between">
                <div className="h-8 w-36 rounded-lg bg-slate-200 animate-pulse" />
                <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
              </div>

              {/* Date & Guest Picker Frame */}
              <div className="rounded-xl border border-slate-200 overflow-hidden space-y-2 p-3 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                  <div className="space-y-1">
                    <div className="h-3 w-16 rounded bg-slate-200" />
                    <div className="h-5 w-24 rounded bg-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-16 rounded bg-slate-200" />
                    <div className="h-5 w-24 rounded bg-slate-200" />
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="h-3 w-16 rounded bg-slate-200" />
                  <div className="h-5 w-32 rounded bg-slate-200" />
                </div>
              </div>

              {/* CTA Button Skeleton */}
              <div className="h-12 w-full rounded-xl bg-slate-900/80 animate-pulse" />

              {/* Price Breakdown Line Items */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
                  <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                  <div className="h-4 w-14 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <div className="h-5 w-20 rounded bg-slate-200 animate-pulse" />
                  <div className="h-5 w-20 rounded bg-slate-200 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
