import React from 'react';
import Link from 'next/link';
import { HomeSectionConfig } from '../config/sections';
import { getSectionListings } from '../api/queries';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { Container } from '@/components/layout/Container';
import { HomepageRail } from './HomepageRail';

interface HomeSectionProps {
  config: HomeSectionConfig;
}

export async function HomeSection({ config }: HomeSectionProps) {
  const listings = (await getSectionListings(config)) || [];

  // Generate the "View all" URL with filters
  const params = new URLSearchParams();
  Object.entries(config.filter).forEach(([key, value]) => {
    params.set(key, value);
  });
  const viewAllHref = `/s?${params.toString()}`;

  return (
    <Container className="py-2">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {config.title}
          </h2>
          {config.subtitle && (
            <p className="mt-0.5 text-xs text-gray-500">{config.subtitle}</p>
          )}
        </div>
        <Link
          href={viewAllHref}
          className="text-xs font-semibold text-blue-600 hover:text-blue-500 whitespace-nowrap"
        >
          View all <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="w-full py-12 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-3xl bg-gray-50/55">
          <p className="text-sm font-semibold text-gray-900">
            No properties available yet
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Check back soon or explore other categories
          </p>
        </div>
      ) : (
        <HomepageRail>
          {listings.map((listing) => (
            <div
              key={`${config.id}-${listing.publicId}`}
              className="flex-shrink-0 w-[280px] sm:w-[310px] snap-start"
            >
              <ListingCard listing={listing} aspectRatio="rail" />
            </div>
          ))}
        </HomepageRail>
      )}
    </Container>
  );
}
