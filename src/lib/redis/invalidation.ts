/**
 * Centralized Cache Invalidation Service.
 *
 * No scattered `redis.del()` calls anywhere else in the codebase.
 * All invalidation logic lives here, making it maintainable and auditable.
 *
 * Search invalidation uses a version counter stored in Redis.
 * Bumping the counter instantly orphans all old search cache entries
 * (they expire naturally via TTL), avoiding expensive `DEL search:*` scans.
 */

import { getProvider } from './client';
import { CacheKeys, SEARCH_VERSION_KEY } from './keys';
import { isCircuitClosed } from './circuit-breaker';
import { recordInvalidate } from './metrics';

export class CacheInvalidation {
  // -----------------------------------------------------------------------
  // Property mutations
  // -----------------------------------------------------------------------

  /** Invalidate all cached domains for a property. */
  static async invalidateProperty(publicId: string): Promise<void> {
    if (!isCircuitClosed()) return;

    const provider = getProvider();
    const keys = [
      CacheKeys.propertyBase(publicId),
      CacheKeys.propertyMedia(publicId),
      CacheKeys.propertyHost(publicId),
      CacheKeys.propertyAmenities(publicId),
      CacheKeys.propertyReviews(publicId),
      CacheKeys.propertyPricing(publicId),
    ];

    await recordInvalidate(`property:${publicId}`, () => provider.del(...keys));
  }

  /** Invalidate only the reviews domain for a property. */
  static async invalidatePropertyReviews(publicId: string): Promise<void> {
    if (!isCircuitClosed()) return;

    const provider = getProvider();
    await recordInvalidate(CacheKeys.propertyReviews(publicId), () =>
      provider.del(CacheKeys.propertyReviews(publicId))
    );
  }

  /** Invalidate only the pricing domain for a property. */
  static async invalidatePropertyPricing(publicId: string): Promise<void> {
    if (!isCircuitClosed()) return;

    const provider = getProvider();
    await recordInvalidate(CacheKeys.propertyPricing(publicId), () =>
      provider.del(CacheKeys.propertyPricing(publicId))
    );
  }

  // -----------------------------------------------------------------------
  // Availability (event-driven)
  // -----------------------------------------------------------------------

  /**
   * Invalidate availability cache for a property.
   * In practice, availability keys include date ranges, so this is a
   * best-effort invalidation of the base key. Fine-grained date-range
   * invalidation can be added when the booking lifecycle is built.
   */
  static async invalidateAvailability(propertyId: string): Promise<void> {
    if (!isCircuitClosed()) return;

    // Since availability keys include date ranges, we cannot enumerate them
    // without scanning. Instead, we rely on short TTLs (60s) as the primary
    // consistency mechanism. This method is a hook for future event-driven
    // invalidation when specific date-range keys are known.
    void propertyId;
  }

  // -----------------------------------------------------------------------
  // Search (version-bump approach)
  // -----------------------------------------------------------------------

  /**
   * Invalidate all search cache entries by bumping the search namespace version.
   * Old keys are orphaned and expire naturally via TTL.
   */
  static async invalidateSearchNamespace(): Promise<void> {
    if (!isCircuitClosed()) return;

    const provider = getProvider();
    await recordInvalidate('search:version', () =>
      provider.incr(SEARCH_VERSION_KEY)
    );
  }

  /**
   * Get the current search namespace version.
   * Used by CacheKeys.searchListings() to build versioned keys.
   */
  static async getSearchVersion(): Promise<number> {
    if (!isCircuitClosed()) return 0;

    const provider = getProvider();
    try {
      const raw = await provider.get(SEARCH_VERSION_KEY);
      return raw ? parseInt(raw, 10) : 0;
    } catch {
      return 0;
    }
  }

  // -----------------------------------------------------------------------
  // Homepage
  // -----------------------------------------------------------------------

  /** Invalidate all homepage cache entries. */
  static async invalidateHomepage(): Promise<void> {
    if (!isCircuitClosed()) return;

    const provider = getProvider();
    const keys = [
      CacheKeys.homeFeatured(),
      CacheKeys.homeCategories(),
      CacheKeys.homeLocations(),
    ];

    await recordInvalidate('home:*', () => provider.del(...keys));
  }

  // -----------------------------------------------------------------------
  // Reference data
  // -----------------------------------------------------------------------

  /** Invalidate the cached accommodation types reference data. */
  static async invalidateAccommodationTypes(): Promise<void> {
    if (!isCircuitClosed()) return;

    const provider = getProvider();
    await recordInvalidate(CacheKeys.accommodationTypes(), () =>
      provider.del(CacheKeys.accommodationTypes())
    );
  }
}
