import Link from 'next/link';
import Image from 'next/image';
import { ListingCardData } from '../types';
import { PLATFORM } from '@/config/platform';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: ListingCardData;
  aspectRatio?: 'square' | 'rail';
}

export function ListingCard({
  listing,
  aspectRatio = 'square',
}: ListingCardProps) {
  return (
    <Link
      href={`/stay/${listing.publicId}`}
      className="group flex flex-col gap-3"
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-xl bg-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
          aspectRatio === 'rail' ? 'aspect-[4/3]' : 'aspect-square'
        )}
      >
        <Image
          src={listing.imageUrl || '/images/placeholders/listing-1.png'}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 right-3 z-10">
          <button className="text-white hover:scale-110 transition-transform hover:text-rose-500 drop-shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-0.5 mt-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 truncate pr-4 text-[15px]">
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
          {listing.furnishing && (
            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded capitalize">
              {listing.furnishing.replace('_', ' ')}
            </span>
          )}
          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded capitalize">
            {listing.occupancyType}
          </span>
        </div>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-semibold text-gray-900 text-[15px]">
            {new Intl.NumberFormat(PLATFORM.LOCALE, {
              style: 'currency',
              currency: PLATFORM.CURRENCY,
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
