'use client';

import { ListingCardData } from '@/features/listings/types';
import { ListingCard } from '@/features/guest/discovery/shared/components/ListingCard';
import { SPACING } from '@/config/spacing';
import { SearchViewMode } from '../../types';
import { cn } from '@/lib/utils';

interface ListingSectionProps {
  listings: ListingCardData[];
  viewMode?: SearchViewMode;
}

export function ListingSection({
  listings,
  viewMode = SearchViewMode.SPLIT,
}: ListingSectionProps) {
  const gridClasses =
    viewMode === SearchViewMode.LIST
      ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 w-full'
      : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 w-full';

  return (
    <div
      className={cn(gridClasses)}
      style={{ gap: SPACING.SEARCH_LAYOUT.cardGap }}
    >
      {listings.map((listing) => (
        <ListingCard key={listing.publicId} listing={listing} />
      ))}
    </div>
  );
}
