import { unstable_cache } from 'next/cache';
import { createStaticClient } from '@/lib/supabase/server';

interface AccommodationTypeMapping {
  id: string;
  name: string;
  description: string | null;
}

/**
 * Next.js `unstable_cache` deduplicates this call across all server components
 * and caches it globally across requests. The accommodation_types table is small and
 * static -- fetching it once per request eliminates redundant round-trips
 * from Categories, HomeSection, and getSectionListings.
 */
export const getAccommodationTypes = unstable_cache(
  async (): Promise<AccommodationTypeMapping[]> => {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from('accommodation_types')
      .select('id, name, description');

    return (data || []) as AccommodationTypeMapping[];
  },
  ['accommodation-types'],
  { revalidate: 3600, tags: ['accommodation-types', 'home'] }
);

/**
 * Resolves an accommodation type name to its UUID.
 * Uses the cached full list to avoid a per-section database round-trip.
 */
export async function resolveAccommodationTypeId(
  name: string
): Promise<string | null> {
  const types = await getAccommodationTypes();
  const match = types.find((t) => t.name.toLowerCase() === name.toLowerCase());
  return match?.id ?? null;
}
