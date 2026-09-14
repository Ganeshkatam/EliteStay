'use client';

import React, { useCallback } from 'react';
import Map, {
  NavigationControl,
  ViewStateChangeEvent,
} from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSearchData } from '../../context/SearchProvider';
import { getMapConfig } from '@/lib/maps';
import { MapViewport } from '../../hooks/useMapSearch';

if (
  typeof window !== 'undefined' &&
  typeof maplibregl.setWorkerUrl === 'function'
) {
  maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
}

interface MapCanvasProps {
  children: React.ReactNode;
  onViewportChange: (vp: MapViewport) => void;
}

export function MapCanvas({ children, onViewportChange }: MapCanvasProps) {
  const { map } = useSearchData();
  const mapConfig = getMapConfig();

  // Fallback to configured defaults if center not available
  const initialLat = map.centerLat ?? 0;
  const initialLng = map.centerLng ?? 0;
  const initialZoom = map.zoom ?? 1;

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
      mapLib={maplibregl}
      initialViewState={{
        longitude: initialLng,
        latitude: initialLat,
        zoom: initialZoom,
      }}
      mapStyle={mapConfig.styleUrl as string}
      minZoom={mapConfig.minZoom}
      maxZoom={mapConfig.maxZoom}
      onMoveEnd={handleMapMove}
      style={{ width: '100%', height: '100%' }}
    >
      <NavigationControl position="top-right" />
      {children}
    </Map>
  );
}
