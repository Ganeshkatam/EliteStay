import { fetchWithCache, CacheKeys, TTL } from '@/lib/redis';
import { PropertyRepository } from '../repositories/property.repository';

export interface PropertyMedia {
  id: string;
  storagePath: string;
  isCover: boolean;
  displayOrder: number;
}

export class PropertyMediaService {
  static async getMedia(publicId: string): Promise<PropertyMedia[]> {
    const data = await fetchWithCache({
      key: CacheKeys.propertyMedia(publicId),
      ttl: TTL.PROPERTY_MEDIA,
      negativeTtl: TTL.NEGATIVE_404,
      fetcher: async () => {
        const raw = await PropertyRepository.getMedia(publicId);
        if (!raw || raw.length === 0) return [];

        return raw.map((img) => ({
          id: img.id,
          storagePath: img.storage_path,
          isCover: img.is_cover,
          displayOrder: img.display_order,
        }));
      },
    });

    return data || [];
  }
}
