import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

interface AccommodationTypeMapping {
  id: string;
  name: string;
  description: string | null;
}

/**
 * React `cache()` deduplicates this call across all server components
 * within the same request. The accommodation_types table is small and
 * static -- fetching it once per request eliminates redundant round-trips
 * from Categories, HomeSection, and getSectionListings.
 */
export const getAccommodationTypes = cache(
  async (): Promise<AccommodationTypeMapping[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from('accommodation_types')
      .select('id, name, description');

    return (data || []) as AccommodationTypeMapping[];
  }
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
