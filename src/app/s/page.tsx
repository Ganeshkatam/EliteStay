import { searchListings } from '@/features/listings/api/queries';
import { ListingCard } from '@/features/listings/components/ListingCard';
import {
  parseSearchParams,
  normalizeFilters,
  buildSearchUrl,
  SEARCH_DEFAULTS,
  type SearchFilters,
} from '@/features/search/lib/search-params';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Active filter label helpers
// ---------------------------------------------------------------------------

function getActiveFilterLabels(filters: SearchFilters): string[] {
  const labels: string[] = [];
  if (filters.city) labels.push(filters.city);
  if (filters.locality) labels.push(filters.locality);
  if (filters.accommodationType) {
    labels.push(
      filters.accommodationType
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    );
  }
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const fmt = (n: number) =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(n);
    if (filters.minPrice !== null && filters.maxPrice !== null) {
      labels.push(`${fmt(filters.minPrice)} - ${fmt(filters.maxPrice)}`);
    } else if (filters.minPrice !== null) {
      labels.push(`From ${fmt(filters.minPrice)}`);
    } else if (filters.maxPrice !== null) {
      labels.push(`Up to ${fmt(filters.maxPrice)}`);
    }
  }
  if (filters.billingPeriod) {
    labels.push(`Per ${filters.billingPeriod}`);
  }
  if (filters.furnishing) {
    labels.push(
      filters.furnishing
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    );
  }
  if (filters.genderPreference && filters.genderPreference !== 'any') {
    labels.push(
      filters.genderPreference === 'female' ? 'Girls Only' : 'Boys Only'
    );
  }
  if (filters.occupancyType) {
    labels.push(
      `${filters.occupancyType.charAt(0).toUpperCase()}${filters.occupancyType.slice(1)} occupancy`
    );
  }
  if (filters.amenities.length > 0) {
    labels.push(
      filters.amenities
        .map((a) => a.charAt(0).toUpperCase() + a.slice(1))
        .join(', ')
    );
  }
  if (filters.availableFrom) {
    labels.push(`From ${filters.availableFrom}`);
  }
  return labels;
}

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

  const activeLabels = getActiveFilterLabels(filters);
  const hasActiveFilters = activeLabels.length > 0;
  const sortLabel =
    filters.sort !== SEARCH_DEFAULTS.sort
      ? filters.sort.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore Stays</h1>
            <p className="mt-2 text-sm text-gray-500">
              {total > 0
                ? `${total} ${total === 1 ? 'property' : 'properties'} found`
                : 'No properties found'}
              {sortLabel && ` -- sorted by ${sortLabel}`}
            </p>
          </div>
          {hasActiveFilters && (
            <Link
              href="/s"
              className="text-sm font-semibold text-blue-600 hover:text-blue-500"
            >
              Clear all filters
            </Link>
          )}
        </div>

        {/* Active filter labels */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {label}
              </span>
            ))}
          </div>
        )}
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
