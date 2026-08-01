'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { MapProvider as ReactMapGLProvider } from 'react-map-gl/maplibre';
import { ReactNode } from 'react';

export function MapProvider({ children }: { children: ReactNode }) {
  return <ReactMapGLProvider>{children}</ReactMapGLProvider>;
}
