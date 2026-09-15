import { ListingCardData } from '@/features/listings/types';
import { MapViewModel } from '../types';
import { SearchFilters } from '../lib/search-params';
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
    let centerLat: number | undefined = undefined;
    let centerLng: number | undefined = undefined;
    let zoom: number | undefined = undefined;

    // 1. If explicit center coordinates are provided in search parameters
    if (filters?.centerLat != null && filters?.centerLng != null) {
      centerLat = filters.centerLat;
      centerLng = filters.centerLng;
      zoom = 12;
    }

    // 2. If a specific city/locality filter is requested
    const targetLocation = filters?.locality || filters?.city;
    if ((centerLat == null || centerLng == null) && targetLocation) {
      const normalized = targetLocation.trim().toLowerCase();

      // Check preset dictionary
      if (CITY_COORDINATES[normalized]) {
        centerLat = CITY_COORDINATES[normalized].lat;
        centerLng = CITY_COORDINATES[normalized].lng;
        zoom = 12;
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
            zoom = 12;
          }
        } catch (err) {
          console.error('Failed to query city coordinates:', err);
        }
      }
    }

    // 3. Fallback to computing center and span dynamically from matching listings
    if (centerLat == null || centerLng == null) {
      const withLoc = listings.filter(
        (l) => l.location.latitude != null && l.location.longitude != null
      );
      if (withLoc.length === 1) {
        centerLat = withLoc[0].location.latitude!;
        centerLng = withLoc[0].location.longitude!;
        zoom = 13;
      } else if (withLoc.length > 1) {
        let minLat = withLoc[0].location.latitude!;
        let maxLat = withLoc[0].location.latitude!;
        let minLng = withLoc[0].location.longitude!;
        let maxLng = withLoc[0].location.longitude!;
        let sumLat = 0;
        let sumLng = 0;

        for (const item of withLoc) {
          const lat = item.location.latitude!;
          const lng = item.location.longitude!;
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          sumLat += lat;
          sumLng += lng;
        }

        centerLat = sumLat / withLoc.length;
        centerLng = sumLng / withLoc.length;

        const maxSpan = Math.max(maxLat - minLat, maxLng - minLng);
        if (maxSpan < 0.05) zoom = 13;
        else if (maxSpan < 0.2) zoom = 11;
        else if (maxSpan < 1) zoom = 9;
        else if (maxSpan < 5) zoom = 6;
        else zoom = 4;
      }
    }

    // 4. Return dynamic map data without imposing any default city
    return {
      centerLat,
      centerLng,
      zoom: zoom ?? 4,
    };
  }
}
