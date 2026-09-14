'use client';

import { useState, useMemo, useCallback } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ListingCardData } from '@/features/listings/types';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  buildSearchUrl,
  parseSearchParams,
  SearchFilters,
} from '@/features/search/lib/search-params';
import { getMapConfig } from '@/lib/maps';

interface MapMoveEvent {
  target: {
    getBounds: () => {
      getSouth: () => number;
      getNorth: () => number;
      getWest: () => number;
      getEast: () => number;
    } | null;
    getCenter: () => { lat: number; lng: number };
  };
}

export function SearchMap({ listings }: { listings: ListingCardData[] }) {
  const [hoveredListing, setHoveredListing] = useState<string | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [mapBounds, setMapBounds] = useState<Partial<SearchFilters> | null>(
    null
  );

  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter listings with valid coordinates
  const mapListings = useMemo(() => {
    return listings.filter(
      (l) => l.location.latitude != null && l.location.longitude != null
    );
  }, [listings]);

  const handleMapMove = useCallback((evt: MapMoveEvent) => {
    const bounds = evt.target.getBounds();
    if (!bounds) return;
    const center = evt.target.getCenter();

    setMapBounds({
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast(),
      centerLat: center.lat,
      centerLng: center.lng,
    });
    setShowSearchButton(true);
  }, []);

  const handleSearchThisArea = useCallback(() => {
    if (!mapBounds) return;

    // Convert ReadonlyURLSearchParams to Record
    const rawParams: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });

    const currentFilters = parseSearchParams(rawParams);

    // Merge bounds into current filters, keeping city and locality filters alongside the bounding box.
    const newFilters = {
      ...currentFilters,
      ...mapBounds,
      page: 1, // Reset page
    };

    router.push(buildSearchUrl(newFilters));
    setShowSearchButton(false);
  }, [mapBounds, router, searchParams]);

  if (mapListings.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center border-l">
        <p className="text-gray-500 text-sm">No map locations available.</p>
      </div>
    );
  }

  const mapConfig = getMapConfig();

  // Calculate rough bounds or center
  const initialLat = mapListings[0].location.latitude!;
  const initialLng = mapListings[0].location.longitude!;

  return (
    <div className="w-full h-full relative">
      <Map
        initialViewState={{
          longitude: initialLng,
          latitude: initialLat,
          zoom: 12,
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapStyle={mapConfig.styleUrl as any}
        minZoom={mapConfig.minZoom}
        maxZoom={mapConfig.maxZoom}
        onMoveEnd={handleMapMove}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        {/* Search this area button */}
        {showSearchButton && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={handleSearchThisArea}
              className="bg-white px-4 py-2 rounded-full shadow-lg border text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors shadow-slate-900/10"
            >
              Search this area
            </button>
          </div>
        )}

        {mapListings.map((listing) => (
          <Marker
            key={listing.publicId}
            longitude={listing.location.longitude!}
            latitude={listing.location.latitude!}
            anchor="bottom"
          >
            <div
              className={`relative cursor-pointer transition-transform ${hoveredListing === listing.publicId ? 'scale-110 z-10' : 'z-0'}`}
              onMouseEnter={() => setHoveredListing(listing.publicId)}
              onMouseLeave={() => setHoveredListing(null)}
            >
              <div className="bg-white rounded-full px-3 py-1 shadow-md border font-semibold text-sm hover:bg-slate-900 hover:text-white transition-colors">
                ${listing.pricing.amount}
              </div>

              {/* Tooltip / Preview Card */}
              {hoveredListing === listing.publicId && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white rounded-lg shadow-xl overflow-hidden border">
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
                    <Link
                      href={`/stay/${listing.publicId}`}
                      className="block mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View details &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
