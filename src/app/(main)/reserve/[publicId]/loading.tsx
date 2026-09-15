export default function ReservationLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8 md:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Checkout Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
          <div className="space-y-1">
            <div className="h-7 w-48 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>

        {/* Two-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Checkout Steps & Forms */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Trip Dates */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="h-5 w-32 rounded bg-slate-200 animate-pulse" />
                <div className="h-4 w-12 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-14 rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1">
                  <div className="h-3 w-16 rounded bg-slate-200" />
                  <div className="h-4 w-24 rounded bg-slate-200" />
                </div>
                <div className="h-14 rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1">
                  <div className="h-3 w-16 rounded bg-slate-200" />
                  <div className="h-4 w-24 rounded bg-slate-200" />
                </div>
              </div>
            </div>

            {/* Step 2: Resident / Guest Profile */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="h-5 w-44 rounded bg-slate-200 animate-pulse" />
              <div className="space-y-3">
                <div className="h-11 rounded-xl bg-slate-50 border border-slate-200/50" />
                <div className="h-11 rounded-xl bg-slate-50 border border-slate-200/50" />
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="h-5 w-48 rounded bg-slate-200 animate-pulse" />
              <div className="space-y-3">
                <div className="h-16 rounded-xl bg-slate-50 border border-slate-200/60 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-slate-200" />
                    <div className="h-4 w-36 rounded bg-slate-200" />
                  </div>
                  <div className="h-6 w-12 rounded bg-slate-200" />
                </div>
                <div className="h-16 rounded-xl bg-slate-50 border border-slate-200/60 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-slate-200" />
                    <div className="h-4 w-28 rounded bg-slate-200" />
                  </div>
                  <div className="h-6 w-12 rounded bg-slate-200" />
                </div>
              </div>
            </div>

            {/* Step 4: Cancellation Policy */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs">
              <div className="h-5 w-36 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-slate-100 animate-pulse" />
            </div>

            {/* Confirm & Book Button */}
            <div className="h-14 w-full rounded-2xl bg-slate-900/80 animate-pulse" />
          </div>

          {/* Right Column: Sticky Reservation Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              {/* Property Card Snippet */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="h-20 w-20 rounded-xl bg-slate-200 animate-pulse shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="h-5 w-3/4 rounded bg-slate-200 animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse" />
                  <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-3">
                <div className="h-5 w-28 rounded bg-slate-200 animate-pulse" />
                <div className="flex justify-between">
                  <div className="h-4 w-36 rounded bg-slate-100 animate-pulse" />
                  <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                  <div className="h-4 w-12 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-28 rounded bg-slate-100 animate-pulse" />
                  <div className="h-4 w-14 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>

              {/* Total Price Section */}
              <div className="flex justify-between items-baseline pt-4 border-t border-slate-200">
                <div className="space-y-1">
                  <div className="h-5 w-24 rounded bg-slate-200 animate-pulse" />
                  <div className="h-3 w-16 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="h-7 w-28 rounded bg-slate-200 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
