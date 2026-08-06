import { GeocodeResult, GeocodingProvider } from '../types';
import { NominatimProvider } from '../providers/NominatimProvider';
import { GeocodingCacheRepository } from '../repositories/GeocodingCacheRepository';
import { createClient, createStaticClient } from '@/lib/supabase/server';
import { Cache, CacheManifest } from '@/lib/redis';

async function fetchFeaturedCities() {
  return Cache.fetch(CacheManifest.homeFeatured(), async () => {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from('cities')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('sort_order');

    return data || [];
  });
}

export class LocationService {
  private static provider: GeocodingProvider = new NominatimProvider();

  static async geocode(address: string): Promise<GeocodeResult> {
    // 1. Check Cache
    const cachedResult =
      await GeocodingCacheRepository.getCachedResult(address);
    if (cachedResult) {
      return cachedResult;
    }

    // 2. Call Provider
    const result = await this.provider.geocode(address);

    // 3. Save to Cache
    await GeocodingCacheRepository.saveToCache(address, result);

    return result;
  }

  static async getFeaturedCities() {
    return fetchFeaturedCities();
  }

  static async searchCities(query: string) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('cities')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .limit(10);
    return data || [];
  }
}
