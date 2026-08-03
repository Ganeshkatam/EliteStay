import { MapConfig } from './types';

export const MAP_CONFIG: MapConfig = {
  provider: 'openfreemap',
  styleUrl: 'https://tiles.openfreemap.org/styles/liberty', // Vector tiles (OpenMapTiles)
  attribution:
    '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> Data from <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
  minZoom: 4,
  maxZoom: 20,
  worldCopies: false,
};

export function getMapConfig(): MapConfig {
  return MAP_CONFIG;
}
