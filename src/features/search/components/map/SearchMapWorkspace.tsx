'use client';

import { MapboxProvider } from '@/components/map/MapboxProvider';
import { MapCanvas } from './MapCanvas';
import { MarkerLayer } from './layers/MarkerLayer';
import { OverlayLayer } from './layers/OverlayLayer';
import { useSearchData } from '../../context/SearchProvider';

export function SearchMapWorkspace() {
  const { results } = useSearchData();

  return (
    <MapboxProvider>
      <div className="w-full h-full relative">
        <MapCanvas>
          <MarkerLayer listings={results.listings} />
          {results.listings.length === 0 && <OverlayLayer />}
        </MapCanvas>
      </div>
    </MapboxProvider>
  );
}
