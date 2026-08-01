'use client';

import { ListingCardData } from '@/features/listings/types';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { SPACING } from '@/config/spacing';

interface ListingSectionProps {
  listings: ListingCardData[];
}

export function ListingSection({ listings }: ListingSectionProps) {
  return (
    <div 
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 w-full"
      style={{ gap: SPACING.SEARCH_LAYOUT.cardGap }}
    >
      {listings.map((listing) => (
        <ListingCard key={listing.publicId} listing={listing} />
      ))}
    </div>
  );
}
