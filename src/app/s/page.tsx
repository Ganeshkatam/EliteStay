import { getDiscoverListings } from '@/features/listings/api/queries';
import { ListingCard } from '@/features/listings/components/ListingCard';
import Link from 'next/link';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { cursor?: string };
}) {
  const cursor = searchParams.cursor;

  // Note: We use searchParams.cursor to support cursor pagination.
  // In a real application, we would also add query params for dates, guests, etc.

  const { data: listings, nextCursor } = await getDiscoverListings(cursor, 12);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Explore Stays</h1>
        <p className="mt-2 text-sm text-gray-500">
          Discover all available properties
        </p>
      </div>

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

      {/* Pagination / Load More */}
      <div className="mt-12 flex justify-center">
        {nextCursor ? (
          <Link
            href={`/s?cursor=${nextCursor}`}
            className="rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            Show more
          </Link>
        ) : listings.length > 0 ? (
          <p className="text-sm text-gray-500">
            You&apos;ve reached the end of the list
          </p>
        ) : null}
      </div>
    </div>
  );
}
