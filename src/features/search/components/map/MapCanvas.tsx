'use client';

import React, { useCallback } from 'react';
import Map, { NavigationControl } from 'react-map-gl/mapbox';
import { useSearchData } from '../../context/SearchProvider';

interface MapCanvasProps {
  children: React.ReactNode;
}

export function MapCanvas({ children }: MapCanvasProps) {
  const { map } = useSearchData();

  // Default to Bangalore center if no data
  const initialLat = map.centerLat ?? 12.9716;
  const initialLng = map.centerLng ?? 77.5946;

  const handleMapMove = useCallback((evt: any) => {
    // We would update UI state context for map bounds here
  }, []);

  return (
    <Map
      initialViewState={{
        longitude: initialLng,
        latitude: initialLat,
        zoom: map.zoom ?? 12
      }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      onMoveEnd={handleMapMove}
    >
      <NavigationControl position="top-right" />
      {children}
    </Map>
  );
}
