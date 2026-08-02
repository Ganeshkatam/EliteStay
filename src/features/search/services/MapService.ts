import { ListingCardData } from '@/features/listings/types';
import { MapViewModel } from '../types';
import { SearchFilters } from '../lib/search-params';
import { MARKET_CONFIG } from '@/config/market';
import { createClient } from '@/lib/supabase/server';

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  mumbai: { lat: 19.076, lng: 72.8777 },
  bombay: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  'new delhi': { lat: 28.6139, lng: 77.209 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  goa: { lat: 15.2993, lng: 74.124 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  noida: { lat: 28.5355, lng: 77.391 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
};

export class MapService {
  static async getMapData(
    listings: ListingCardData[],
    filters?: SearchFilters
  ): Promise<MapViewModel> {
    let centerLat: number | null = null;
    let centerLng: number | null = null;

    // 1. If explicit center coordinates are provided in search parameters
    if (filters?.centerLat != null && filters?.centerLng != null) {
      centerLat = filters.centerLat;
      centerLng = filters.centerLng;
    }

    // 2. If a specific city/locality filter is requested
    const targetLocation = filters?.locality || filters?.city;
    if ((centerLat == null || centerLng == null) && targetLocation) {
      const normalized = targetLocation.trim().toLowerCase();

      // Check preset dictionary
      if (CITY_COORDINATES[normalized]) {
        centerLat = CITY_COORDINATES[normalized].lat;
        centerLng = CITY_COORDINATES[normalized].lng;
      } else {
        // Query database cities table
        try {
          const supabase = await createClient();
          const { data } = await supabase
            .from('cities')
            .select('latitude, longitude')
            .or(`name.ilike.%${targetLocation}%,slug.ilike.%${targetLocation}%`)
            .not('latitude', 'is', null)
            .limit(1)
            .maybeSingle();

          if (data?.latitude != null && data?.longitude != null) {
            centerLat = data.latitude;
            centerLng = data.longitude;
          }
        } catch (err) {
          console.error('Failed to query city coordinates:', err);
        }
      }
    }

    // 3. Fallback to first listing with valid location coordinates
    if (centerLat == null || centerLng == null) {
      const withLoc = listings.filter(
        (l) => l.location.latitude && l.location.longitude
      );
      if (withLoc.length > 0) {
        centerLat = withLoc[0].location.latitude!;
        centerLng = withLoc[0].location.longitude!;
      }
    }

    // 4. Default fallback to market default
    return {
      centerLat: centerLat ?? MARKET_CONFIG.DEFAULT_MAP_CENTER.lat,
      centerLng: centerLng ?? MARKET_CONFIG.DEFAULT_MAP_CENTER.lng,
      zoom: 12,
    };
  }
}
