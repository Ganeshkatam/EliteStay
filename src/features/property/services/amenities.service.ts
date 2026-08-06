import { Cache, CacheManifest } from '@/lib/redis';
import { PropertyRepository } from '../repositories/property.repository';

export interface PropertyAmenity {
  id: string;
  name: string;
  icon: string | null;
  isFeatured: boolean;
  categoryId: number;
}

export class AmenitiesService {
  static async getAmenities(publicId: string): Promise<PropertyAmenity[]> {
    const data = await Cache.fetch(
      CacheManifest.propertyAmenities(publicId),
      async () => {
        const raw = await PropertyRepository.getAmenities(publicId);
        if (!raw) return [];

        type SupabaseAmenity = {
          id: string;
          name: string;
          icon: string | null;
          is_featured: boolean;
          category_id: number;
        };
        return raw.map(
          (row: { amenities: SupabaseAmenity | SupabaseAmenity[] }) => {
            const amenity = Array.isArray(row.amenities)
              ? row.amenities[0]
              : row.amenities;
            return {
              id: amenity.id,
              name: amenity.name,
              icon: amenity.icon,
              isFeatured: amenity.is_featured,
              categoryId: amenity.category_id,
            };
          }
        );
      }
    );

    return data || [];
  }
}
