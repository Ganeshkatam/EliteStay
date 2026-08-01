import React from 'react';
import Link from 'next/link';
import { HomeSectionConfig } from '../config/sections';
import { getSectionListings } from '../api/queries';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { Container } from '@/components/layout/Container';

interface HomeSectionProps {
  config: HomeSectionConfig;
}

export async function HomeSection({ config }: HomeSectionProps) {
  const listings = await getSectionListings(config);

  if (!listings || listings.length === 0) {
    return null; // Don't render empty sections
  }

  // Generate the "View all" URL with filters
  const params = new URLSearchParams();
  Object.entries(config.filter).forEach(([key, value]) => {
    params.set(key, value);
  });
  const viewAllHref = `/s?${params.toString()}`;

  return (
    <Container className="py-2">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {config.title}
          </h2>
          {config.subtitle && (
            <p className="mt-1 text-sm text-gray-500">{config.subtitle}</p>
          )}
        </div>
        <Link
          href={viewAllHref}
          className="text-sm font-semibold text-blue-600 hover:text-blue-500 whitespace-nowrap"
        >
          View all <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <div className="flex overflow-x-auto pb-6 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 sm:gap-x-6 gap-y-10 xl:gap-x-6 snap-x scrollbar-hide">
        {listings.map((listing) => (
          <div key={listing.publicId} className="min-w-[85vw] sm:min-w-0 snap-center pr-4 sm:pr-0">
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </Container>
  );
}
