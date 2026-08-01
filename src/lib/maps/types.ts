export interface Viewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface ProviderMetadata {
  id: string;
  renderer: 'maplibre' | 'mapbox';
  supportsTerrain: boolean;
  supports3D: boolean;
}

export interface MapConfig {
  provider: string;
  styleUrl: string;
  attribution: string;
  defaultViewport: Viewport;
  minZoom: number;
  maxZoom: number;
  worldCopies: boolean;
}
