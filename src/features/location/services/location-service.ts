import { GeocodeResult, GeocodingProvider } from '../types';
import { NominatimProvider } from '../providers/NominatimProvider';
import { GeocodingCacheRepository } from '../repositories/GeocodingCacheRepository';
import { createClient } from '@/lib/supabase/server';

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
    const supabase = await createClient();
    const { data } = await supabase
      .from('cities')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('sort_order');

    if (!data || data.length === 0) return [];

    const citiesWithRealCounts = await Promise.all(
      data.map(async (city) => {
        const { count } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .ilike('city', `%${city.name}%`)
          .eq('status', 'published');

        return {
          ...city,
          listing_count: count ?? city.listing_count ?? 0,
        };
      })
    );

    return citiesWithRealCounts;
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
