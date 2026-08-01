'use client';

import { MapProvider } from '@/components/map/MapProvider';
import { MapCanvas } from './MapCanvas';
import { MarkerLayer } from './layers/MarkerLayer';
import { MapControlsOverlay } from './MapControlsOverlay';
import { useSearchData } from '../../context/SearchProvider';
import { useMapSearch } from '../../hooks/useMapSearch';

export function SearchMapWorkspace() {
  const { results } = useSearchData();
  const {
    searchAsMapMoves,
    setSearchAsMapMoves,
    viewportChanged,
    handleViewportChange,
    handleSearchThisArea,
  } = useMapSearch();

  return (
    <MapProvider>
      <div className="w-full h-full relative">
        <MapCanvas onViewportChange={handleViewportChange}>
          <MarkerLayer listings={results.listings} />
        </MapCanvas>
        <MapControlsOverlay
          searchAsMapMoves={searchAsMapMoves}
          setSearchAsMapMoves={setSearchAsMapMoves}
          viewportChanged={viewportChanged}
          onSearchThisArea={handleSearchThisArea}
        />
      </div>
    </MapProvider>
  );
}
