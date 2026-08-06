import React from 'react';
import Link from 'next/link';
import { HomeSectionConfig } from '../config/sections';
import { getSectionListings } from '../api/queries';
import { ListingCard } from '@/features/guest/discovery/shared/components/ListingCard';
import { Container } from '@/components/layout/Container';
import { observeServerComponent } from '@/lib/observability/instrumentation/react-observer';

interface HomeSectionProps {
  config: HomeSectionConfig;
}

export async function HomeSection({ config }: HomeSectionProps) {
  return observeServerComponent(`HomeSection.${config.id}`, async () => {
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
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-hide">
            {listings.map((listing) => (
              <div
                key={`${config.id}-${listing.publicId}`}
                className="snap-start shrink-0 w-[70vw] sm:w-[240px] md:w-[220px] lg:w-[200px]"
              >
                <ListingCard listing={listing} aspectRatio="square" />
              </div>
            ))}
            {listings.length >= config.limit && (
              <div className="snap-start shrink-0 w-[70vw] sm:w-[240px] md:w-[220px] lg:w-[200px] flex items-center justify-center">
                <Link
                  href={viewAllHref}
                  className="group flex flex-col items-center justify-center w-full aspect-square rounded-3xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300 shadow-sm">
                    <svg
                      className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    See all
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Explore {config.title}
                  </span>
                </Link>
              </div>
            )}
          </div>
        )}
      </Container>
    );
  });
}
