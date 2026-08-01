'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { MapProvider } from 'react-map-gl/mapbox';
import { ReactNode } from 'react';

export function MapboxProvider({ children }: { children: ReactNode }) {
  return (
    <MapProvider>
      {children}
    </MapProvider>
  );
}
