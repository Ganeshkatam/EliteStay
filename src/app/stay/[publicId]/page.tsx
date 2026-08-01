import { getListingDetail } from '@/features/listings/api/queries';
import { ImageGallery } from '@/features/listings/components/ImageGallery';
import { BookingWidget } from '@/features/bookings/components/BookingWidget';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Metadata } from 'next';
import { ShareButton } from '@/features/listings/components/ShareButton';

interface ListingPageProps {
  params: {
    publicId: string;
  };
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const listing = await getListingDetail(params.publicId);

  if (!listing) return { title: 'Not Found' };

  return {
    title: `${listing.title} - EliteStay`,
    description:
      listing.description ||
      `Stay at this ${listing.accommodationType} in ${listing.location.city}`,
    openGraph: {
      title: listing.title,
      description:
        listing.description ||
        `Stay at this ${listing.accommodationType} in ${listing.location.city}`,
      images: listing.images.length > 0 ? [listing.images[0].url] : [],
    },
    alternates: {
      canonical: `https://elitestay.com/stay/${listing.publicId}`,
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const listing = await getListingDetail(params.publicId);

  if (!listing) {
    notFound();
  }

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
    numberOfRooms: 1, // Defaulting as occupants is removed
    offers: {
      '@type': 'Offer',
      price: listing.pricing.amount,
      priceCurrency: listing.pricing.currency,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2">
          {/* Host Info */}
          <div className="flex items-center justify-between border-b pb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {listing.accommodationType} hosted by {listing.host.fullName}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-gray-500">
                <span className="capitalize">{listing.occupancyType}</span>
                <span>&middot;</span>
                <span className="capitalize">
                  {listing.furnishing.replace('_', ' ')}
                </span>
                {listing.genderPreference !== 'any' && (
                  <>
                    <span>&middot;</span>
                    <span className="text-rose-600 font-medium">
                      {listing.genderPreference === 'female'
                        ? 'Girls Only'
                        : 'Boys Only'}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-2 text-sm text-green-600 font-medium">
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
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gray-200">
              {listing.host.avatarUrl ? (
                <Image
                  src={listing.host.avatarUrl}
                  alt={listing.host.fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-900 text-lg text-white">
                  {listing.host.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="border-b py-6">
            <h3 className="text-lg font-semibold text-gray-900">
              About this space
            </h3>
            <p className="mt-4 text-gray-600 leading-relaxed whitespace-pre-wrap">
              {listing.description || 'No description provided.'}
            </p>
          </div>

          {/* Amenities */}
          <div className="py-6">
            <h3 className="text-lg font-semibold text-gray-900">
              What this place offers
            </h3>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {listing.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 text-gray-700"
                >
                  <span className="flex h-8 w-8 items-center justify-center text-gray-400">
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
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
            {listing.amenities.length === 0 && (
              <p className="text-gray-500">Amenities not specified.</p>
            )}
          </div>
        </div>

        {/* Right Column - Booking Widget Sidebar */}
        <div className="lg:col-span-1">
          <BookingWidget 
            listingId={listing.id} 
            pricing={{
              amount: listing.pricing.amount,
              currency: listing.pricing.currency,
              billingPeriod: listing.pricing.billingPeriod,
              securityDeposit: listing.pricing.securityDeposit,
              maintenanceFee: listing.pricing.maintenanceFee,
              maintenanceFeePeriod: listing.pricing.maintenanceFeePeriod,
              minimumDuration: listing.pricing.minimumDuration
            }} 
          />
        </div>
      </div>
    </div>
  );
}
