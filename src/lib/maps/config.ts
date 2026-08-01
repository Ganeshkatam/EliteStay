import { MapConfig } from './types';

const osmStyle = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const MAP_CONFIG: MapConfig = {
  provider: 'openstreetmap',
  styleUrl: osmStyle,
  attribution:
    '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  minZoom: 4,
  maxZoom: 20,
  worldCopies: false,
};

export function getMapConfig(): MapConfig {
  return MAP_CONFIG;
}
