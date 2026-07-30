import { searchListings } from '@/features/listings/api/queries';
import { ListingCard } from '@/features/listings/components/ListingCard';
import {
  parseSearchParams,
  normalizeFilters,
  buildSearchUrl,
  SEARCH_DEFAULTS,
} from '@/features/search/lib/search-params';
import Link from 'next/link';
import { SearchFilterBar } from '@/features/search/components/SearchFilterBar';
import { ActiveFilters } from '@/features/search/components/ActiveFilters';

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawParams = await searchParams;
  const filters = normalizeFilters(parseSearchParams(rawParams));
  const {
    data: listings,
    total,
    page,
    totalPages,
  } = await searchListings(filters);

  const sortLabel =
    filters.sort !== SEARCH_DEFAULTS.sort
      ? filters.sort.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Header and Interactive Filters */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Explore Stays</h1>

        <SearchFilterBar filters={filters} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            {total > 0
              ? `${total} ${total === 1 ? 'property' : 'properties'} found`
              : 'No properties found'}
            {sortLabel && ` -- sorted by ${sortLabel}`}
          </p>
          <ActiveFilters filters={filters} />
        </div>
      </div>

      {/* Listings grid */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {listings.map((listing) => (
            <ListingCard key={listing.publicId} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No properties found
          </h3>
          <p className="mt-1 text-gray-500">
            Try adjusting your search criteria.
          </p>
          <div className="mt-6">
            <Link
              href="/s"
              className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Clear filters
            </Link>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2">
          {/* Previous */}
          {page > 1 ? (
            <Link
              href={buildSearchUrl({ ...filters, page: page - 1 })}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed">
              Previous
            </span>
          )}

          {/* Page indicator */}
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          {/* Next */}
          {page < totalPages ? (
            <Link
              href={buildSearchUrl({ ...filters, page: page + 1 })}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-400 cursor-not-allowed">
              Next
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
