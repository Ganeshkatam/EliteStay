import { MapConfig } from './types';

export const MAP_CONFIG: MapConfig = {
  provider: 'openfreemap',
  styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
  attribution:
    '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> contributors',
  defaultViewport: {
    latitude: 12.9716, // Bangalore Lat
    longitude: 77.5946, // Bangalore Lng
    zoom: 12,
  },
  minZoom: 4,
  maxZoom: 20,
  worldCopies: false,
};

export function getMapConfig(): MapConfig {
  return MAP_CONFIG;
}
