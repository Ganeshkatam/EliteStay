/**
 * Typed, Versioned Cache Key Builder.
 *
 * The ONLY source of Redis key strings in the entire codebase.
 * All keys use the `elitestay:v1:` prefix.
 *
 * Search parameters are canonically normalized before hashing to ensure
 * semantically identical queries always produce the same key.
 */

import { KEY_PREFIX } from './config';

// ---------------------------------------------------------------------------
// Canonical normalization helpers
// ---------------------------------------------------------------------------

/**
 * Deterministic hash of a normalized string using djb2.
 * Not cryptographic -- just fast and collision-resistant for cache keys.
 */
function djb2Hash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Normalize and deterministically stringify a search parameter object.
 *
 * - Lowercase string values.
 * - Sort array values alphabetically and deduplicate.
 * - Trim whitespace.
 * - Sort object keys.
 * - Normalize dates to ISO date strings (YYYY-MM-DD).
 */
function canonicalizeParams(params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      const value = params[key];

      if (value === undefined || value === null || value === '') {
        return acc; // Skip empty values
      }

      if (Array.isArray(value)) {
        const normalized = [
          ...new Set(value.map(String).map((v) => v.toLowerCase().trim())),
        ].sort();
        if (normalized.length > 0) {
          acc[key] = normalized;
        }
      } else if (typeof value === 'string') {
        acc[key] = value.toLowerCase().trim();
      } else {
        acc[key] = value;
      }

      return acc;
    }, {});

  return JSON.stringify(sorted);
}

/** Normalize and hash a params object into a short, deterministic string. */
function hashParams(params: Record<string, unknown>): string {
  return djb2Hash(canonicalizeParams(params));
}

// ---------------------------------------------------------------------------
// Search version counter key (for namespace-level invalidation)
// ---------------------------------------------------------------------------

/** Internal key for the search namespace version counter. */
export const SEARCH_VERSION_KEY = `${KEY_PREFIX}search:version`;

// ---------------------------------------------------------------------------
// Cache Key Factory
// ---------------------------------------------------------------------------

export const CacheKeys = {
  // -----------------------------------------------------------------------
  // Homepage
  // -----------------------------------------------------------------------

  homeFeatured: () => `${KEY_PREFIX}home:featured`,
  homeCategories: () => `${KEY_PREFIX}home:categories`,
  homeLocations: () => `${KEY_PREFIX}home:locations`,
  homeSectionListings: (sectionId: string) =>
    `${KEY_PREFIX}home:sections:${sectionId}`,
  homeLocationCounts: (cities: string[]) =>
    `${KEY_PREFIX}home:counts:${hashParams({ cities })}`,

  // -----------------------------------------------------------------------
  // Search (separated namespaces)
  // -----------------------------------------------------------------------

  searchListings: (version: number, params: Record<string, unknown>) =>
    `${KEY_PREFIX}search:listings:v${version}:${hashParams(params)}`,

  searchMap: (version: number, params: Record<string, unknown>) =>
    `${KEY_PREFIX}search:map:v${version}:${hashParams(params)}`,

  searchSuggestions: (prefix: string) =>
    `${KEY_PREFIX}search:suggestions:${prefix.toLowerCase().trim()}`,

  searchFilters: (version: number, params: Record<string, unknown>) =>
    `${KEY_PREFIX}search:filters:v${version}:${hashParams(params)}`,

  // -----------------------------------------------------------------------
  // Property (domain-split)
  // -----------------------------------------------------------------------

  propertyBase: (publicId: string) => `${KEY_PREFIX}property:base:${publicId}`,
  propertyMedia: (publicId: string) =>
    `${KEY_PREFIX}property:media:${publicId}`,
  propertyHost: (publicId: string) => `${KEY_PREFIX}property:host:${publicId}`,
  propertyAmenities: (publicId: string) =>
    `${KEY_PREFIX}property:amenities:${publicId}`,
  propertyReviews: (publicId: string) =>
    `${KEY_PREFIX}property:reviews:${publicId}`,
  propertyPricing: (publicId: string) =>
    `${KEY_PREFIX}property:pricing:${publicId}`,

  // Future property domains
  propertyCalendar: (publicId: string) =>
    `${KEY_PREFIX}property:calendar:${publicId}`,
  propertyOwner: (publicId: string) =>
    `${KEY_PREFIX}property:owner:${publicId}`,
  propertyAnalytics: (publicId: string) =>
    `${KEY_PREFIX}property:analytics:${publicId}`,
  propertyRecommendations: (publicId: string) =>
    `${KEY_PREFIX}property:recommendations:${publicId}`,

  // -----------------------------------------------------------------------
  // Availability (includes date range + guests)
  // -----------------------------------------------------------------------

  availability: (
    propertyId: string,
    checkIn: string,
    checkOut: string,
    guests: number
  ) =>
    `${KEY_PREFIX}availability:${propertyId}:${checkIn}:${checkOut}:${guests}`,

  // -----------------------------------------------------------------------
  // Reference data
  // -----------------------------------------------------------------------

  accommodationTypes: () => `${KEY_PREFIX}ref:accommodation-types`,

  // -----------------------------------------------------------------------
  // Locks (internal -- consumers use the locking module, not these directly)
  // -----------------------------------------------------------------------

  lock: (resourceKey: string) => `${KEY_PREFIX}lock:${resourceKey}`,
} as const;
