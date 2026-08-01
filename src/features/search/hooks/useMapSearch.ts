'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useSearchData } from '../context/SearchProvider';
import { useSearchUrl } from './useSearchUrl';
import { getMapConfig } from '@/lib/maps';

export interface MapViewport {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

const STORAGE_KEY = 'elitestay:search_as_map_moves';

// Viewport equality check with tolerance (approx 20m lat/lng, 0.15 zoom)
export function isSameViewport(
  a: MapViewport | null,
  b: MapViewport | null
): boolean {
  if (!a || !b) return false;
  const latDiff = Math.abs(a.center.lat - b.center.lat);
  const lngDiff = Math.abs(a.center.lng - b.center.lng);
  const zoomDiff = Math.abs(a.zoom - b.zoom);
  return latDiff < 0.0002 && lngDiff < 0.0002 && zoomDiff < 0.15;
}

export function useMapSearch() {
  const { filters } = useSearchData();
  const { updateFilters } = useSearchUrl(filters);

  // Initialize preference state from localStorage if available, otherwise fallback to true
  const [searchAsMapMoves, setSearchAsMapMoves] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const persisted = window.localStorage.getItem(STORAGE_KEY);
      return persisted !== null ? persisted === 'true' : true;
    }
    return true;
  });

  const [viewportChanged, setViewportChanged] = useState(false);
  const [pendingViewport, setPendingViewport] = useState<MapViewport | null>(
    null
  );
  const [lastSearchedViewport, setLastSearchedViewport] =
    useState<MapViewport | null>(() => {
      // Populate initial state from search URL filters if present
      if (filters.centerLat != null && filters.centerLng != null) {
        const mapConfig = getMapConfig();
        return {
          center: { lat: filters.centerLat, lng: filters.centerLng },
          zoom: mapConfig.defaultViewport.zoom,
          bounds: {
            north: filters.maxLat ?? 0,
            south: filters.minLat ?? 0,
            east: filters.maxLng ?? 0,
            west: filters.minLng ?? 0,
          },
        };
      }
      return null;
    });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize localStorage preference
  const toggleSearchAsMapMoves = useCallback((val: boolean) => {
    setSearchAsMapMoves(val);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, String(val));
    }
  }, []);

  // Trigger search update
  const triggerSearch = useCallback(
    (vp: MapViewport) => {
      setLastSearchedViewport(vp);
      setViewportChanged(false);

      updateFilters(
        {
          minLat: vp.bounds.south,
          maxLat: vp.bounds.north,
          minLng: vp.bounds.west,
          maxLng: vp.bounds.east,
          centerLat: vp.center.lat,
          centerLng: vp.center.lng,
          page: 1, // Reset page
        },
        true // Use router.replace to avoid browser history bloat
      );
    },
    [updateFilters]
  );

  // Debounced search trigger when pendingViewport changes and searchAsMapMoves is active
  useEffect(() => {
    if (!pendingViewport || !searchAsMapMoves) return;

    // Check if the viewport has actually changed meaningfully from the last searched viewport
    if (
      lastSearchedViewport &&
      isSameViewport(pendingViewport, lastSearchedViewport)
    ) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      triggerSearch(pendingViewport);
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [pendingViewport, searchAsMapMoves, lastSearchedViewport, triggerSearch]);

  // Triggered by map component onMoveEnd
  const handleViewportChange = useCallback(
    (vp: MapViewport) => {
      setPendingViewport(vp);

      // Determine if viewport is significantly different from last searched
      if (lastSearchedViewport && isSameViewport(vp, lastSearchedViewport)) {
        setViewportChanged(false);
      } else {
        setViewportChanged(true);
      }
    },
    [lastSearchedViewport]
  );

  const handleSearchThisArea = useCallback(() => {
    if (pendingViewport) {
      triggerSearch(pendingViewport);
    }
  }, [pendingViewport, triggerSearch]);

  return {
    searchAsMapMoves,
    setSearchAsMapMoves: toggleSearchAsMapMoves,
    viewportChanged,
    pendingViewport,
    lastSearchedViewport,
    handleViewportChange,
    handleSearchThisArea,
  };
}
