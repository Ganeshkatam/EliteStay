import { Cache, CacheManifest } from '@/lib/redis';
import { PropertyRepository } from '../repositories/property.repository';

export interface PropertyMedia {
  id: string;
  storagePath: string;
  isCover: boolean;
  displayOrder: number;
}

export class PropertyMediaService {
  static async getMedia(publicId: string): Promise<PropertyMedia[]> {
    const data = await Cache.fetch(
      CacheManifest.propertyMedia(publicId),
      async () => {
        const raw = await PropertyRepository.getMedia(publicId);
        if (!raw || raw.length === 0) return [];

        return raw.map((img) => ({
          id: img.id,
          storagePath: img.storage_path,
          isCover: img.is_cover,
          displayOrder: img.display_order,
        }));
      }
    );

    return data || [];
  }
}
