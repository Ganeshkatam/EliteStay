import { MapConfig } from './types';

export const MAP_CONFIG: MapConfig = {
  provider: 'openfreemap',
  styleUrl:
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  minZoom: 4,
  maxZoom: 20,
  worldCopies: false,
};

export function getMapConfig(): MapConfig {
  return MAP_CONFIG;
}
