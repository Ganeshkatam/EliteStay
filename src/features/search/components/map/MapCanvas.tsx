'use client';

import React, { useCallback } from 'react';
import Map, {
  NavigationControl,
  ViewStateChangeEvent,
} from 'react-map-gl/maplibre';
import { useSearchData } from '../../context/SearchProvider';
import { getMapConfig } from '@/lib/maps';
import { MapViewport } from '../../hooks/useMapSearch';

interface MapCanvasProps {
  children: React.ReactNode;
  onViewportChange: (vp: MapViewport) => void;
}

export function MapCanvas({ children, onViewportChange }: MapCanvasProps) {
  const { map } = useSearchData();
  const mapConfig = getMapConfig();

  // Fallback to configured defaults if center not available
  const initialLat = map.centerLat ?? mapConfig.defaultViewport.latitude;
  const initialLng = map.centerLng ?? mapConfig.defaultViewport.longitude;
  const initialZoom = map.zoom ?? mapConfig.defaultViewport.zoom;

  const handleMapMove = useCallback(
    (evt: ViewStateChangeEvent) => {
      const bounds = evt.target.getBounds();
      if (!bounds) return;
      const center = evt.target.getCenter();

      onViewportChange({
        center: {
          lat: center.lat,
          lng: center.lng,
        },
        zoom: evt.target.getZoom(),
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        },
      });
    },
    [onViewportChange]
  );

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
