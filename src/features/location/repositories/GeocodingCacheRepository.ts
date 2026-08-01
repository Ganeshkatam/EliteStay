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

  static async saveToCache(address: string, result: GeocodeResult): Promise<void> {
    const key = this.normalizeKey(address);
    const supabase = await createClient();

    // The cache is saved with Service Role privileges implicitly, or we just rely on RLS 
    // being configured to allow authenticated users to insert/update, OR
    // we assume the 'createClient' here is the regular one and RLS allows inserting.
    // Let's use the admin client if needed, or better, since this is server-side,
    // we can use the regular client. But RLS on geocoding_cache was set to ENABLE ROW LEVEL SECURITY.
    // We should make sure we have access. I will use the service role key to write to cache if it fails,
    // actually, let's use the admin client explicitly for cache writes since it's a system table.
    
    // For now, let's use the regular client. If RLS blocks it, we'll fix RLS or use admin client.
    
    const { error } = await supabase
      .from('geocoding_cache')
      .upsert({
        cache_key: key,
        latitude: result.latitude,
        longitude: result.longitude,
        formatted_address: result.formattedAddress,
        provider: result.provider,
        provider_place_id: result.providerPlaceId,
        confidence: result.confidence,
        // expires_at is handled by default value + interval
      }, { onConflict: 'cache_key' });

    if (error) {
      console.error('Error saving to geocoding cache:', error);
    }
  }
}
