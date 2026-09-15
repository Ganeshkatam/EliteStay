'use client';

import { ListingCardData } from '@/features/listings/types';
import { ListingCard } from '@/features/guest/discovery/shared/components/ListingCard';
import { SPACING } from '@/config/spacing';
import { SearchViewMode } from '../../types';
import { useSearchUI } from '../../context/SearchProvider';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ListingSectionProps {
  listings: ListingCardData[];
  viewMode?: SearchViewMode;
}

export function ListingSection({
  listings,
  viewMode = SearchViewMode.SPLIT,
}: ListingSectionProps) {
  const { isSearching } = useSearchUI();

  const gridClasses =
    viewMode === SearchViewMode.LIST
      ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 w-full'
      : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 w-full';

  return (
    <div className="relative w-full">
      {/* Floating Loading Pill during active query updates */}
      {isSearching && (
        <div className="sticky top-6 z-20 flex justify-center w-full pointer-events-none mb-4">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-slate-900/90 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
            <span>Updating available residences...</span>
          </div>
        </div>
      )}

      {/* Listing Cards Grid with Smooth Opacity Shimmer */}
      <div
        className={cn(
          gridClasses,
          'transition-all duration-300',
          isSearching
            ? 'opacity-40 pointer-events-none scale-[0.995]'
            : 'opacity-100 scale-100'
        )}
        style={{ gap: SPACING.SEARCH_LAYOUT.cardGap }}
      >
        {listings.map((listing) => (
          <ListingCard key={listing.publicId} listing={listing} />
        ))}
      </div>
    </div>
  );
}
