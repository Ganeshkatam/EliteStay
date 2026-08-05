/**
 * Core Cache Engine -- `fetchWithCache`.
 *
 * The primary API for caching any data through the Redis distributed state layer.
 *
 * Flow:
 *   1. Circuit breaker check (OPEN? -> skip to DB).
 *   2. In-process request coalescing (same Node? -> share Promise).
 *   3. Redis GET (HIT? -> deserialize, check SWR, return).
 *   4. Distributed lock acquisition with exponential backoff.
 *   5. Execute fetcher (DB call).
 *   6. Serialize (compress if >4KB), SET with jittered TTL.
 *   7. Release lock, return result.
 *
 * Features:
 *   - Stale-while-revalidate with lock-protected background refresh.
 *   - Negative caching for 404/empty results.
 *   - Circuit breaker graceful fallback.
 *   - Request coalescing within same process.
 *   - Stampede protection via distributed locks.
 *   - Full observability instrumentation.
 */

import { getProvider } from './client';
import {
  isCircuitClosed,
  recordSuccess,
  recordFailure,
} from './circuit-breaker';
import { coalesce } from './request-coalescer';
import { acquireLockWithBackoff, releaseLock, acquireLock } from './locks';
import { encode, decode, isStale } from './serializer';
import { withJitter } from './ttl';
import { STALE_WINDOW_FRACTION, DEFAULT_LOCK_TTL_MS } from './config';
import {
  recordHit,
  recordMiss,
  recordWrite,
  recordCacheLatency,
  recordFetcherLatency,
  dbFallbackCounter,
  cacheStaleServeCounter,
} from './metrics';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FetchWithCacheOptions<T> {
  /** The full cache key (use CacheKeys to build). */
  key: string;

  /** Base TTL in seconds (jitter will be applied). */
  ttl: number;

  /** TTL for caching null/empty results. Defaults to 0 (no negative caching). */
  negativeTtl?: number;

  /** Lock TTL in milliseconds for stampede protection. */
  lockTtl?: number;

  /** The data-fetching function to call on cache miss. */
  fetcher: () => Promise<T | null>;
}

/**
 * Fetch data through the distributed cache layer.
 *
 * Returns the cached value on HIT, or executes the fetcher on MISS,
 * caches the result, and returns it.
 */
export async function fetchWithCache<T>(
  options: FetchWithCacheOptions<T>
): Promise<T | null> {
  const {
    key,
    ttl,
    negativeTtl = 0,
    lockTtl = DEFAULT_LOCK_TTL_MS,
    fetcher,
  } = options;

  // 1. Circuit breaker -- if OPEN, skip Redis entirely
  if (!isCircuitClosed()) {
    dbFallbackCounter.inc();
    return executeFetcher(key, fetcher);
  }

  // 2. Request coalescing -- deduplicate within the same process
  return coalesce(key, () =>
    fetchOrPopulate(key, ttl, negativeTtl, lockTtl, fetcher)
  );
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

async function fetchOrPopulate<T>(
  key: string,
  ttl: number,
  negativeTtl: number,
  lockTtl: number,
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  const provider = getProvider();

  // 3. Redis GET
  try {
    const cacheStart = Date.now();
    const raw = await provider.get(key);
    recordCacheLatency(Date.now() - cacheStart);
    recordSuccess();

    if (raw !== null) {
      const envelope = decode<T>(raw);

      // Negative cache hit
      if (envelope.negative) {
        return recordHit(key, () => null);
      }

      // Check stale-while-revalidate window
      if (isStale(envelope, STALE_WINDOW_FRACTION)) {
        cacheStaleServeCounter.inc();
        // Serve stale data immediately
        const staleResult = recordHit(key, () => envelope.payload);
        // Trigger lock-protected background refresh (fire-and-forget)
        triggerBackgroundRefresh(key, ttl, negativeTtl, lockTtl, fetcher);
        return staleResult;
      }

      // Fresh hit
      return recordHit(key, () => envelope.payload);
    }
  } catch {
    // Redis read failed -- fall through to fetcher
    recordFailure();
  }

  // 4. Cache MISS -- acquire lock and fetch
  return recordMiss(key, () =>
    fetchAndPopulate(key, ttl, negativeTtl, lockTtl, fetcher)
  );
}

async function fetchAndPopulate<T>(
  key: string,
  ttl: number,
  negativeTtl: number,
  lockTtl: number,
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  const provider = getProvider();
  const lockKey = `fetch:${key}`;

  // Attempt to acquire the distributed lock
  const ownerToken = await acquireLockWithBackoff(lockKey, lockTtl);

  if (!ownerToken) {
    // Lock not acquired -- another process is fetching.
    // Try reading from cache one more time (the winner may have populated it).
    try {
      const raw = await provider.get(key);
      if (raw !== null) {
        const envelope = decode<T>(raw);
        return envelope.negative ? null : envelope.payload;
      }
    } catch {
      // Redis still failing -- fall through to direct DB fetch
      recordFailure();
    }

    // Fallback: fetch directly from DB without caching
    dbFallbackCounter.inc();
    return executeFetcher(key, fetcher);
  }

  try {
    // 5. Execute the fetcher
    const result = await executeFetcher(key, fetcher);

    // 6. Cache the result
    try {
      const jitteredTtl = withJitter(ttl);

      if (result === null || (Array.isArray(result) && result.length === 0)) {
        // Negative caching
        if (negativeTtl > 0) {
          const encoded = encode<T>(null, negativeTtl, true);
          await recordWrite(key, () =>
            provider.set(key, encoded, withJitter(negativeTtl))
          );
        }
      } else {
        // Positive caching
        const encoded = encode(result, jitteredTtl);
        await recordWrite(key, () => provider.set(key, encoded, jitteredTtl));
      }
      recordSuccess();
    } catch {
      // Cache write failed -- not fatal, result still returned
      recordFailure();
    }

    return result;
  } finally {
    // 7. Release lock
    await releaseLock(lockKey, ownerToken).catch(() => {
      // Lock release failed -- it will expire via TTL
    });
  }
}

/**
 * Trigger a background refresh for stale cache entries.
 * Lock-protected to prevent refresh stampedes.
 */
function triggerBackgroundRefresh<T>(
  key: string,
  ttl: number,
  negativeTtl: number,
  lockTtl: number,
  fetcher: () => Promise<T | null>
): void {
  const refreshLockKey = `refresh:${key}`;

  // Fire-and-forget: attempt to acquire a refresh lock
  void (async () => {
    const ownerToken = await acquireLock(refreshLockKey, lockTtl);
    if (!ownerToken) return; // Another process is already refreshing

    try {
      const provider = getProvider();
      const result = await executeFetcher(key, fetcher);
      const jitteredTtl = withJitter(ttl);

      if (result === null || (Array.isArray(result) && result.length === 0)) {
        if (negativeTtl > 0) {
          const encoded = encode<T>(null, negativeTtl, true);
          await provider.set(key, encoded, withJitter(negativeTtl));
        }
      } else {
        const encoded = encode(result, jitteredTtl);
        await provider.set(key, encoded, jitteredTtl);
      }
    } catch {
      // Background refresh failed -- stale entry remains until TTL expires
    } finally {
      await releaseLock(refreshLockKey, ownerToken).catch(() => {});
    }
  })();
}

/**
 * Execute the fetcher function with latency recording.
 */
async function executeFetcher<T>(
  _key: string,
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  const start = Date.now();
  try {
    return await fetcher();
  } finally {
    recordFetcherLatency(Date.now() - start);
  }
}
