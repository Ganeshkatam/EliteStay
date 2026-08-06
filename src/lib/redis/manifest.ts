/* eslint-disable @typescript-eslint/no-explicit-any */
import { KEY_PREFIX } from './config';

// ---------------------------------------------------------------------------
// Canonical normalization helpers
// ---------------------------------------------------------------------------

function djb2Hash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function canonicalizeParams(params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      const value = params[key];
      if (value === undefined || value === null || value === '') return acc;

      if (Array.isArray(value)) {
        const normalized = [
          ...new Set(value.map(String).map((v) => v.toLowerCase().trim())),
        ].sort();
        if (normalized.length > 0) acc[key] = normalized;
      } else if (typeof value === 'string') {
        acc[key] = value.toLowerCase().trim();
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
  return JSON.stringify(sorted);
}

export function hashParams(params: Record<string, unknown>): string {
  return djb2Hash(canonicalizeParams(params));
}

export interface CacheManifestEntry {
  key: string;
  policy: string;
  tags: string[];
}

/**
 * Maps domain features to their required cache policies and tags.
 */
export const CacheManifest: Record<
  string,
  (...args: any[]) => CacheManifestEntry
> = {
  propertyBase: (id: string) => ({
    key: `${KEY_PREFIX}prop_base:${id}`,
    policy: 'property',
    tags: ['property', `property:${id}`],
  }),
  propertyMedia: (id: string) => ({
    key: `${KEY_PREFIX}prop_media:${id}`,
    policy: 'property',
    tags: ['property', `property:${id}`],
  }),
  propertyAmenities: (id: string) => ({
    key: `${KEY_PREFIX}prop_amenities:${id}`,
    policy: 'property',
    tags: ['property', `property:${id}`],
  }),
  propertyHost: (id: string) => ({
    key: `${KEY_PREFIX}prop_host:${id}`,
    policy: 'property',
    tags: ['property', `property:${id}`],
  }),
  propertyReviews: (id: string) => ({
    key: `${KEY_PREFIX}prop_reviews:${id}`,
    policy: 'reviews',
    tags: ['property', `property:${id}`, `reviews:${id}`],
  }),
  propertyPricing: (id: string) => ({
    key: `${KEY_PREFIX}prop_pricing:${id}`,
    policy: 'pricing',
    tags: ['property', `property:${id}`, `pricing:${id}`],
  }),

  // Search
  searchListings: (version: number, params: Record<string, unknown>) => ({
    key: `${KEY_PREFIX}search:listings:v${version}:${hashParams(params)}`,
    policy: 'search',
    tags: ['search'],
  }),
  searchMap: (version: number, params: Record<string, unknown>) => ({
    key: `${KEY_PREFIX}search:map:v${version}:${hashParams(params)}`,
    policy: 'search',
    tags: ['search'],
  }),
  searchFilters: (version: number, params: Record<string, unknown>) => ({
    key: `${KEY_PREFIX}search:filters:v${version}:${hashParams(params)}`,
    policy: 'search',
    tags: ['search'],
  }),
  searchSuggestions: (prefix: string) => ({
    key: `${KEY_PREFIX}search:suggestions:${prefix.toLowerCase().trim()}`,
    policy: 'search',
    tags: ['search'],
  }),
  searchCities: (query: string) => ({
    key: `${KEY_PREFIX}search_cities:${query.toLowerCase()}`,
    policy: 'search',
    tags: ['search', 'search_cities'],
  }),

  // Home
  homeFeatured: () => ({
    key: `${KEY_PREFIX}home:featured`,
    policy: 'homepage',
    tags: ['homepage'],
  }),
  homeLocations: () => ({
    key: `${KEY_PREFIX}home:locations`,
    policy: 'homepage',
    tags: ['homepage'],
  }),
  homeCategories: () => ({
    key: `${KEY_PREFIX}home:categories`,
    policy: 'homepage',
    tags: ['homepage'],
  }),
  homeSectionListings: (sectionId: string) => ({
    key: `${KEY_PREFIX}home:sections:${sectionId}`,
    policy: 'homepage',
    tags: ['homepage'],
  }),
  homeLocationCounts: (cities: string[]) => ({
    key: `${KEY_PREFIX}home:counts:${hashParams({ cities })}`,
    policy: 'homepage',
    tags: ['homepage'],
  }),

  // Reference Data
  accommodationTypes: () => ({
    key: `${KEY_PREFIX}ref:accommodation_types`,
    policy: 'homepage',
    tags: ['ref'],
  }),

  // Availability
  availability: (
    propertyId: string,
    checkIn: string,
    checkOut: string,
    guests: number
  ) => ({
    key: `${KEY_PREFIX}availability:${propertyId}:${checkIn}:${checkOut}:${guests}`,
    policy: 'availability',
    tags: [
      'availability',
      `availability:${propertyId}`,
      `property:${propertyId}`,
    ],
  }),

  // Search version counter key
  searchVersion: () => ({
    key: `${KEY_PREFIX}search:version`,
    policy: 'search',
    tags: [],
  }),
} as const;
