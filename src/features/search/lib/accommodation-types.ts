// src/features/search/lib/accommodation-types.ts
//
// Static slug-to-UUID map for accommodation types.
// The URL uses human-readable slugs (e.g. "pg", "hostel").
// The RPC filters by UUID for efficient index lookups.
//
// When new accommodation types are added to the seed data, this map must
// be updated to match. Eventually this could be replaced by a DB lookup
// or a build-time code-generation step.

const ACCOMMODATION_TYPE_MAP: Record<string, string> = {
  pg: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  hostel: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  apartment: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  'independent-house': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
  villa: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
  'private-room': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
  'shared-room': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
  'service-apartment': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
  'co-living': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
};

/**
 * Resolve a URL slug to the accommodation_type UUID.
 * Returns `null` for unknown slugs (the RPC will skip the filter).
 */
export function resolveAccommodationTypeId(slug: string | null): string | null {
  if (!slug) return null;
  return ACCOMMODATION_TYPE_MAP[slug.toLowerCase()] ?? null;
}

/**
 * Reverse lookup: get the slug for a given accommodation type name.
 * Used when building URLs from display names (e.g. "PG" -> "pg").
 */
export function accommodationTypeSlug(name: string): string | null {
  const normalised = name.toLowerCase().replace(/\s+/g, '-');
  if (normalised in ACCOMMODATION_TYPE_MAP) return normalised;
  return null;
}
