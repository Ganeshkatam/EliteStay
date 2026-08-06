import { fetchWithCache, CacheKeys, TTL } from '@/lib/redis';
import { PropertyRepository } from '../repositories/property.repository';

export interface PropertyHost {
  id: string;
  name: string;
  avatarUrl: string | null;
  joinedAt: string;
  isVerified: boolean;
}

export class HostService {
  static async getHost(publicId: string): Promise<PropertyHost | null> {
    const data = await fetchWithCache({
      key: CacheKeys.propertyHost(publicId),
      ttl: TTL.PROPERTY_HOST,
      negativeTtl: TTL.NEGATIVE_404,
      fetcher: async () => {
        const raw = await PropertyRepository.getHost(publicId);
        if (!raw || !raw.profiles) return null;

        const profile = Array.isArray(raw.profiles)
          ? raw.profiles[0]
          : raw.profiles;
        const hostProfile = Array.isArray(raw.host_profiles)
          ? raw.host_profiles[0]
          : raw.host_profiles;

        return {
          id: raw.host_id,
          name: profile?.display_name || 'Host',
          avatarUrl: profile?.avatar_storage_path || null,
          joinedAt: profile?.created_at,
          isVerified: !!hostProfile?.identity_verified_at,
        };
      },
    });

    return data;
  }
}
