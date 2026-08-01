import { ListingCardData } from '@/features/listings/types';
import { MapViewModel } from '../types';
import { MARKET_CONFIG } from '@/config/market';

export class MapService {
  static async getMapData(listings: ListingCardData[]): Promise<MapViewModel> {
    // Determine bounds and center from listings, or fallback to config
    let centerLat: number = MARKET_CONFIG.DEFAULT_MAP_CENTER.lat;
    let centerLng: number = MARKET_CONFIG.DEFAULT_MAP_CENTER.lng;

    if (listings.length > 0) {
      const withLoc = listings.filter(l => l.location.latitude && l.location.longitude);
      if (withLoc.length > 0) {
        centerLat = withLoc[0].location.latitude!;
        centerLng = withLoc[0].location.longitude!;
      }
    }

    return {
      centerLat,
      centerLng,
      zoom: 12
    };
  }
}
