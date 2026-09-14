import { MapConfig } from './types';

export const MAP_CONFIG: MapConfig = {
  provider: 'openfreemap',
  styleUrl:
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
    'https://tiles.openfreemap.org/styles/liberty',
  attribution:
    '&copy; <a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
  minZoom: 4,
  maxZoom: 20,
  worldCopies: false,
};

export function getMapConfig(): MapConfig {
  return MAP_CONFIG;
}
