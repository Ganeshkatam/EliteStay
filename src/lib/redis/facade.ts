import {
  fetchWithCache,
  getWithCache,
  setWithCache,
  deleteKey,
  getMany,
  setMany,
  fetchMany,
} from './cache';
import {
  invalidateTag,
  getSearchVersion,
  invalidateSearchNamespace,
} from './invalidation';
import { acquireLock, releaseLock } from './locks';

/**
 * Unified Cache Facade
 *
 * This is the ONLY module that features should import for caching.
 * Everything else (providers, serializers, circuit breakers) is internal.
 */
export const Cache = {
  /** Fetch a single manifest entry. Serves stale data if within SWR window while refreshing in background. */
  fetch: fetchWithCache,

  /** Get a single manifest entry directly, returning null on miss. */
  get: getWithCache,

  /** Set a single manifest entry directly. */
  set: setWithCache,

  /** Explicitly delete a cache key. */
  delete: deleteKey,

  /** Fetch multiple manifest entries concurrently. Handles misses and stampedes safely. */
  fetchMany,

  /** Get multiple manifest entries concurrently. */
  getMany,

  /** Set multiple manifest entries concurrently. */
  setMany,

  /** Invalidate all keys associated with a specific tag (e.g. "property:123"). */
  invalidateTag,

  /** Legacy: Invalidate search namespace (migrating to tags). */
  invalidateSearchNamespace: invalidateSearchNamespace,

  /** Legacy: Get current search namespace version (migrating to tags). */
  getSearchVersion,

  /** Acquire a distributed lock. */
  lock: acquireLock,

  /** Release a distributed lock. */
  unlock: releaseLock,
};
