import { createClient } from '@/lib/supabase/server';
import { GeocodeResult } from '../types';

export class GeocodingCacheRepository {
  /**
   * Normalizes the address string into a cache key.
   * - Lowercase
   * - Collapse multiple spaces
   * - Remove trailing/leading spaces
   * - Remove spaces around commas
   */
  static normalizeKey(address: string): string {
    return address
      .toLowerCase()
      .trim()
      .replace(/\\s+/g, ' ')
      .replace(/\\s*,\\s*/g, ',')
      .replace(/,+$/g, '');
  }

  static async getCachedResult(address: string): Promise<GeocodeResult | null> {
    const key = this.normalizeKey(address);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('geocoding_cache')
      .select('*')
      .eq('cache_key', key)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Error fetching from geocoding cache:', error);
      return null;
    }

    if (!data) return null;

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      formattedAddress: data.formatted_address,
      provider: data.provider,
      providerPlaceId: data.provider_place_id || undefined,
      confidence: data.confidence ? Number(data.confidence) : undefined,
    };
  }

  static async saveToCache(
    address: string,
    result: GeocodeResult
  ): Promise<void> {
    const key = this.normalizeKey(address);
    const supabase = await createClient();

    // Cache writes use the authenticated user context.
    // RLS scopes INSERT/UPDATE to the 'authenticated' role.

    const { error } = await supabase.from('geocoding_cache').upsert(
      {
        cache_key: key,
        latitude: result.latitude,
        longitude: result.longitude,
        formatted_address: result.formattedAddress,
        provider: result.provider,
        provider_place_id: result.providerPlaceId,
        confidence: result.confidence,
        // expires_at is handled by default value + interval
      },
      { onConflict: 'cache_key' }
    );

    if (error) {
      console.error('Error saving to geocoding cache:', error);
    }
  }
}
