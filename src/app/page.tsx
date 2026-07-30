import { getFeaturedListings } from '@/features/listings/api/queries';
import { ListingCard } from '@/features/listings/components/ListingCard';
import Link from 'next/link';

export default async function HomePage() {
  const featuredListings = await getFeaturedListings();

  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-slate-900 py-24 text-center text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Find your next perfect accommodation
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-300">
            Discover flexible living spaces, long-term rentals, and trusted
            homes around the world.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/s"
              className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Start exploring
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Featured accommodations
          </h2>
          <Link
            href="/s"
            className="text-sm font-semibold text-blue-600 hover:text-blue-500"
          >
            See all <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.publicId} listing={listing} />
          ))}
        </div>

        {featuredListings.length === 0 && (
          <div className="mt-8 text-center text-gray-500">
            No featured accommodations found.
          </div>
        )}
      </section>
    </div>
  );
}
