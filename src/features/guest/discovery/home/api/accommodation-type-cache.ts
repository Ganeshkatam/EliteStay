import { createStaticClient } from '@/lib/supabase/server';
import { Cache, CacheManifest } from '@/lib/redis';

export interface AccommodationTypeMapping {
  id: string;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
  description: string | null;
}

/**
 * Fetches accommodation types through the Redis distributed cache layer.
 * The accommodation_types table is small and static -- cached for 3 minutes.
 */
export async function getAccommodationTypes(): Promise<
  AccommodationTypeMapping[]
> {
  const result = await Cache.fetch<AccommodationTypeMapping[]>(
    CacheManifest.accommodationTypes(),
    async () => {
      const supabase = createStaticClient();
      const { data } = await supabase
        .from('accommodation_types')
        .select('id, name, slug, description, icon, display_order')
        .order('display_order');

      return (data || []) as AccommodationTypeMapping[];
    }
  );

  return result || [];
}

/**
 * Resolves an accommodation type name to its UUID.
 * Uses the cached full list to avoid a per-section database round-trip.
 */
export async function resolveAccommodationTypeId(
  slug: string | null
): Promise<string | null> {
  if (!slug) return null;
  const types = await getAccommodationTypes();
  const match = types.find((t) => t.slug === slug);
  return match?.id ?? null;
}
