'use client';

import React, { useCallback } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import { useSearchData } from '../../context/SearchProvider';
import { getMapConfig } from '@/lib/maps';

interface MapCanvasProps {
  children: React.ReactNode;
}

export function MapCanvas({ children }: MapCanvasProps) {
  const { map } = useSearchData();
  const mapConfig = getMapConfig();

  // Fallback to configured defaults if center not available
  const initialLat = map.centerLat ?? mapConfig.defaultViewport.latitude;
  const initialLng = map.centerLng ?? mapConfig.defaultViewport.longitude;
  const initialZoom = map.zoom ?? mapConfig.defaultViewport.zoom;

  const handleMapMove = useCallback(() => {
    // We would update UI state context for map bounds here
  }, []);

  return (
    <Map
      initialViewState={{
        longitude: initialLng,
        latitude: initialLat,
        zoom: initialZoom,
      }}
      mapStyle={mapConfig.styleUrl}
      minZoom={mapConfig.minZoom}
      maxZoom={mapConfig.maxZoom}
      onMoveEnd={handleMapMove}
    >
      <NavigationControl position="top-right" />
      {children}
    </Map>
  );
}
