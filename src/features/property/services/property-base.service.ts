import { fetchWithCache, CacheKeys, TTL } from '@/lib/redis';
import { PropertyRepository } from '../repositories/property.repository';

export interface PropertyBase {
  id: string;
  publicId: string;
  title: string;
  description: string;
  accommodationType: string;
  occupancyType: string;
  furnishing: string;
  maxOccupants: number;
  location: {
    city: string;
    locality: string;
    formattedAddress: string;
    latitude: number;
    longitude: number;
  };
  bookingPolicy:
    | 'INSTANT_RESERVATION'
    | 'RENTAL_APPLICATION'
    | 'VIEWING_REQUEST'
    | 'CONTACT_HOST';
}

export class PropertyBaseService {
  static async getBaseDetails(publicId: string): Promise<PropertyBase | null> {
    const data = await fetchWithCache({
      key: CacheKeys.propertyBase(publicId),
      ttl: TTL.PROPERTY_BASE,
      negativeTtl: TTL.NEGATIVE_404,
      fetcher: async () => {
        const raw = await PropertyRepository.getBaseDetails(publicId);
        if (!raw) return null;

        return {
          id: raw.id,
          publicId: raw.public_id,
          title: raw.title,
          description: raw.description,
          // Handle Supabase join array/object differences cleanly
          accommodationType: Array.isArray(raw.accommodation_types)
            ? raw.accommodation_types[0]?.name
            : (raw.accommodation_types as { name: string })?.name,
          occupancyType: raw.occupancy_type,
          furnishing: raw.furnishing,
          maxOccupants: raw.max_occupants,
          location: {
            city: raw.city,
            locality: raw.locality,
            formattedAddress: raw.formatted_address,
            latitude: raw.latitude,
            longitude: raw.longitude,
          },
          bookingPolicy: raw.booking_policy || 'RENTAL_APPLICATION',
        } as PropertyBase;
      },
    });

    return data;
  }
}
