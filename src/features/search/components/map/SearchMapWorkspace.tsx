'use client';

import { MapProvider } from '@/components/map/MapProvider';
import { MapCanvas } from './MapCanvas';
import { MarkerLayer } from './layers/MarkerLayer';
import { OverlayLayer } from './layers/OverlayLayer';
import { useSearchData } from '../../context/SearchProvider';

export function SearchMapWorkspace() {
  const { results } = useSearchData();

  return (
    <MapProvider>
      <div className="w-full h-full relative">
        <MapCanvas>
          <MarkerLayer listings={results.listings} />
          {results.listings.length === 0 && <OverlayLayer />}
        </MapCanvas>
      </div>
    </MapProvider>
  );
}
