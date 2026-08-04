// src/features/search/lib/accommodation-types.ts
import { getAccommodationTypes } from '@/features/guest/discovery/home/api/accommodation-type-cache';

/**
 * Resolve a URL slug to the accommodation_type UUID.
 * Returns `null` for unknown slugs (the RPC will skip the filter).
 * This reads dynamically from the cached DB response.
 */
export async function resolveAccommodationTypeId(
  slug: string | null
): Promise<string | null> {
  if (!slug) return null;
  const types = await getAccommodationTypes();
  const type = types.find((t) => t.slug === slug.toLowerCase());
  return type ? type.id : null;
}

/**
 * Reverse lookup: get the slug for a given accommodation type name.
 * Used when building URLs from display names (e.g. "PG" -> "pg").
 */
export async function accommodationTypeSlug(
  name: string
): Promise<string | null> {
  if (!name) return null;
  const types = await getAccommodationTypes();
  const type = types.find((t) => t.name.toLowerCase() === name.toLowerCase());
  return type ? type.slug : null;
}
