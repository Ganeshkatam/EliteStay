'use client';

import { ImageGallery } from '@/features/listings/components/ImageGallery';
import { ShareButton } from '@/features/listings/components/ShareButton';
import Image from 'next/image';
import { ListingDetailsViewModel } from '../types';

interface ListingDetailsWorkspaceProps {
  viewModel: ListingDetailsViewModel;
}

export function ListingDetailsWorkspace({
  viewModel,
}: ListingDetailsWorkspaceProps) {
  const { listing } = viewModel;

  // JSON-LD Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: listing.title,
    description: listing.description,
    image: listing.images.map((img) => img.url),
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.location.city,
      addressRegion: listing.location.state,
    },
    numberOfRooms: 1,
    offers: {
      '@type': 'Offer',
      price: listing.pricing.amount,
      priceCurrency: listing.pricing.currency,
    },
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 sm:pb-28 sm:pt-8 lg:px-8 md:pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {listing.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1 font-semibold text-gray-900">
              <svg
                className="h-4 w-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              4.9 (120 reviews)
            </span>
            <span>&middot;</span>
            <span className="font-medium hover:underline cursor-pointer">
              {listing.location.locality
                ? `${listing.location.locality}, `
                : ''}
              {listing.location.city}, {listing.location.state}
            </span>
          </div>
        </div>
        <div className="flex items-center shrink-0">
          <ShareButton title={listing.title} />
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mb-10">
        <ImageGallery images={listing.images} />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 relative">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-10">
          {/* Host Info */}
          <div className="flex items-center justify-between border-b pb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {listing.accommodationType} hosted by {listing.host.fullName}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-gray-500 text-sm">
                <span className="capitalize">{listing.occupancyType}</span>
                <span>&middot;</span>
                <span className="capitalize">
                  {listing.furnishing.replace('_', ' ')}
                </span>
                {listing.genderPreference !== 'any' && (
                  <>
                    <span>&middot;</span>
                    <span className="text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded">
                      {listing.genderPreference === 'female'
                        ? 'Girls Only'
                        : 'Boys Only'}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-3 text-sm text-green-700 font-medium flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                Available From:{' '}
                {new Date(
                  listing.availability.availableFrom
                ).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-slate-200 shrink-0 shadow-sm border border-slate-100">
              {listing.host.avatarUrl ? (
                <Image
                  src={listing.host.avatarUrl}
                  alt={listing.host.fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-900 text-lg text-white font-medium">
                  {listing.host.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="border-b pb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              About this space
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base">
              {listing.description || 'No description provided.'}
            </p>
          </div>

          {/* Amenities */}
          <div className="pb-8 border-b">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              What this place offers
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {listing.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 text-gray-700"
                >
                  <span className="flex h-6 w-6 items-center justify-center text-slate-500">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {/* Temporary icon placeholder */}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="text-base">{amenity.name}</span>
                </div>
              ))}
            </div>
            {listing.amenities.length === 0 && (
              <p className="text-gray-500 italic">Amenities not specified.</p>
            )}
          </div>

          {/* Reviews Widget Placeholder (to be implemented) */}
          <div className="pb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Reviews
            </h3>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
              <p className="text-slate-500">
                Reviews widget will be injected here.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Reservation CTA Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <div className="bg-white rounded-2xl shadow-xl border p-6">
              <div className="mb-6">
                <span className="text-2xl font-bold">
                  {listing.pricing.currency === 'INR'
                    ? '₹'
                    : listing.pricing.currency}
                  {listing.pricing.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-gray-500">
                  {' '}
                  / {listing.pricing.billingPeriod.toLowerCase()}
                </span>
              </div>

              <a
                href={`/reserve/${listing.publicId}`}
                className="flex min-h-11 w-full items-center justify-center rounded-lg bg-black px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Reserve
              </a>
              <p className="mt-4 text-center text-sm text-gray-500">
                You won&apos;t be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Reservation Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-bold text-gray-900">
              {listing.pricing.currency === 'INR'
                ? '₹'
                : listing.pricing.currency}
              {listing.pricing.amount.toLocaleString('en-IN')}
              <span className="ml-1 text-xs font-medium text-gray-500">
                / {listing.pricing.billingPeriod.toLowerCase()}
              </span>
            </div>
            <p className="truncate text-xs text-gray-500">You won&apos;t be charged yet</p>
          </div>
          <a
            href={`/reserve/${listing.publicId}`}
            className="flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Reserve
          </a>
        </div>
      </div>
    </div>
  );
}
