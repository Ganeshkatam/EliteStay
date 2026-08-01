'use client';

import { Marker } from 'react-map-gl/mapbox';
import { ListingCardData } from '@/features/listings/types';
import { useSearchUI } from '../../../context/SearchProvider';

interface MarkerLayerProps {
  listings: ListingCardData[];
}

export function MarkerLayer({ listings }: MarkerLayerProps) {
  const { hoveredListingId, setHoveredListingId } = useSearchUI();

  const mapListings = listings.filter(
    (l) => l.location.latitude != null && l.location.longitude != null
  );

  return (
    <>
      {mapListings.map((listing) => (
        <Marker
          key={listing.publicId}
          longitude={listing.location.longitude!}
          latitude={listing.location.latitude!}
          anchor="bottom"
        >
          <div
            className={`relative cursor-pointer transition-transform ${hoveredListingId === listing.publicId ? 'scale-110 z-10' : 'z-0'}`}
            onMouseEnter={() => setHoveredListingId(listing.publicId)}
            onMouseLeave={() => setHoveredListingId(null)}
          >
            <div
              className={`bg-white rounded-full px-3 py-1 shadow-md border font-semibold text-sm transition-colors ${hoveredListingId === listing.publicId ? 'bg-gray-900 text-white' : 'text-gray-900 hover:bg-gray-900 hover:text-white'}`}
            >
              ₹{listing.pricing.amount}
            </div>

            {hoveredListingId === listing.publicId && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white rounded-2xl shadow-xl overflow-hidden border">
                {listing.imageUrl ? (
                  <div className="h-24 w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-full bg-gray-200" />
                )}
                <div className="p-3">
                  <h4 className="font-semibold text-sm truncate">
                    {listing.title}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {listing.location.locality}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Marker>
      ))}
    </>
  );
}
