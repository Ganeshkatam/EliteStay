import { createStaticClient } from '@/lib/supabase/server';
import { fetchWithCache, CacheKeys, TTL } from '@/lib/redis';

interface AccommodationTypeMapping {
  id: string;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
  description: string | null;
}

/**
 * Fetches accommodation types through the Redis distributed cache layer.
 * The accommodation_types table is small and static -- cached for 1 hour.
 */
export async function getAccommodationTypes(): Promise<
  AccommodationTypeMapping[]
> {
  const result = await fetchWithCache<AccommodationTypeMapping[]>({
    key: CacheKeys.accommodationTypes(),
    ttl: TTL.ACCOMMODATION_REF,
    negativeTtl: TTL.NEGATIVE_EMPTY,
    fetcher: async () => {
      const supabase = createStaticClient();
      const { data } = await supabase
        .from('accommodation_types')
        .select('id, name, slug, description, icon, display_order')
        .order('display_order');

      return (data || []) as AccommodationTypeMapping[];
    },
  });

  return result || [];
}

/**
 * Resolves an accommodation type name to its UUID.
 * Uses the cached full list to avoid a per-section database round-trip.
 */
export async function resolveAccommodationTypeId(
  name: string | null
): Promise<string | null> {
  if (!name) return null;
  const types = await getAccommodationTypes();
  const match = types.find((t) => t.name.toLowerCase() === name.toLowerCase());
  return match?.id ?? null;
}
