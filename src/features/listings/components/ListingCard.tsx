import Link from 'next/link';
import Image from 'next/image';
import { ListingCardData } from '../types';

interface ListingCardProps {
  listing: ListingCardData;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/stay/${listing.publicId}`}
      className="group flex flex-col gap-3"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-200">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      {/* Content */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 truncate pr-4 text-lg">
            {listing.title}
          </h3>
          <span className="flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded-md text-gray-700 font-medium">
            {listing.accommodationType}
          </span>
        </div>

        <p className="text-gray-500 text-sm truncate">
          {listing.location.locality
            ? `${listing.location.locality}, ${listing.location.city}`
            : listing.location.city}
        </p>

        <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600 font-medium">
          {listing.genderPreference !== 'any' && (
            <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded">
              {listing.genderPreference === 'female'
                ? 'Girls Only'
                : 'Boys Only'}
            </span>
          )}
          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded capitalize">
            {listing.furnishing.replace('_', ' ')}
          </span>
          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded capitalize">
            {listing.occupancyType}
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-bold text-gray-900 text-lg">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: listing.pricing.currency || 'INR',
              minimumFractionDigits: 0,
            }).format(listing.pricing.amount)}
          </span>
          <span className="text-gray-500 text-sm">
            / {listing.pricing.billingPeriod}
          </span>
        </div>
      </div>
    </Link>
  );
}
