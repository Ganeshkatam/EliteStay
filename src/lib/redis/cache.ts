/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProvider } from './client';
import {
  isCircuitClosed,
  recordSuccess,
  recordFailure,
} from './circuit-breaker';
import { coalesce } from './request-coalescer';
import { acquireLockWithBackoff, releaseLock, acquireLock } from './locks';
import { encode, decode } from './serializer';
import { withJitter } from './ttl';
import { DEFAULT_LOCK_TTL_MS } from './config';
import {
  recordHit,
  recordMiss,
  recordWrite,
  recordCacheLatency,
  recordFetcherLatency,
  dbFallbackCounter,
  cacheStaleServeCounter,
} from './metrics';
import { CacheManifestEntry } from './manifest';
import { CachePolicyRegistry } from './registry';
import { instrumentExecution } from '@/lib/observability/instrumentation/instrumentation';

// ---------------------------------------------------------------------------
// Internal Policy Resolution
// ---------------------------------------------------------------------------

function getPolicy(entry: CacheManifestEntry) {
  const policy = CachePolicyRegistry[entry.policy];
  if (!policy) throw new Error(`Unknown cache policy: ${entry.policy}`);
  return policy;
}

// ---------------------------------------------------------------------------
// Set Tags Helper
// ---------------------------------------------------------------------------

async function applyTags(key: string, tags: string[]) {
  if (tags.length === 0) return;
  const provider = getProvider();
  await Promise.all(tags.map((tag) => provider.sadd(`tag:${tag}`, key)));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchWithCache<T>(
  entry: CacheManifestEntry,
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  const policy = getPolicy(entry);

  if (!isCircuitClosed()) {
    dbFallbackCounter.inc();
    return executeFetcher(entry.key, fetcher);
  }

  return coalesce(entry.key, () => fetchOrPopulate(entry, policy, fetcher));
}

export async function getWithCache<T>(
  entry: CacheManifestEntry
): Promise<T | null> {
  if (!isCircuitClosed()) return null;
  const provider = getProvider();
  try {
    const raw = await provider.get(entry.key);
    if (!raw) return null;
    const envelope = await instrumentExecution(
      'Serializer.decode',
      'CACHE',
      () => decode<T>(raw)
    );
    return envelope.negative ? null : envelope.payload;
  } catch {
    return null;
  }
}

export async function setWithCache<T>(
  entry: CacheManifestEntry,
  payload: T | null
): Promise<void> {
  if (!isCircuitClosed()) return;
  const provider = getProvider();
  const policy = getPolicy(entry);

  try {
    let ttl = policy.jitter ? withJitter(policy.ttl) : policy.ttl;

    if (payload === null || (Array.isArray(payload) && payload.length === 0)) {
      if (!policy.negativeCache) return;
      ttl = policy.jitter ? withJitter(policy.negativeTtl) : policy.negativeTtl;
      const encoded = await instrumentExecution(
        'Serializer.encode',
        'CACHE',
        () => encode(null, ttl, true, !policy.compression)
      );
      await provider.set(entry.key, encoded, ttl);
    } else {
      const encoded = await instrumentExecution(
        'Serializer.encode',
        'CACHE',
        () => encode(payload, ttl, false, !policy.compression)
      );
      await provider.set(entry.key, encoded, ttl);
    }

    await recordWrite(entry.key, async () => {
      await applyTags(entry.key, entry.tags);
    });
  } catch {
    // Ignore cache set failures
  }
}

export async function deleteKey(key: string): Promise<void> {
  if (!isCircuitClosed()) return;
  const provider = getProvider();

  // Clean up set memberships where possible (requires scanning tags, but typically
  // explicit deletes are handled by invalidateTag. If this is a direct delete,
  // we just delete the key. Automatic cleanup handles tag pruning).
  await provider.del(key);
}

// ---------------------------------------------------------------------------
// Internal Fetch Logic
// ---------------------------------------------------------------------------

async function fetchOrPopulate<T>(
  entry: CacheManifestEntry,
  policy: ReturnType<typeof getPolicy>,
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  const provider = getProvider();
  const { key } = entry;

  try {
    const cacheStart = Date.now();
    const raw = await provider.get(key);
    recordCacheLatency(Date.now() - cacheStart);
    recordSuccess();

    if (raw !== null) {
      const envelope = decode<T>(raw);

      if (envelope.negative) {
        return recordHit(key, () => null);
      }

      // Check SWR (stale window in seconds)
      const now = Math.floor(Date.now() / 1000);
      const age = now - envelope.createdAt;
      const freshThreshold = policy.ttl - policy.staleWindow;

      const isEntryStale =
        policy.staleWindow > 0 && age >= freshThreshold && age < policy.ttl;

      if (isEntryStale) {
        cacheStaleServeCounter.inc();
        const staleResult = recordHit(key, () => envelope.payload);
        triggerBackgroundRefresh(entry, policy, fetcher);
        return staleResult;
      }

      return recordHit(key, () => envelope.payload);
    }
  } catch {
    recordFailure();
  }

  return recordMiss(key, () => fetchAndPopulate(entry, policy, fetcher));
}

async function fetchAndPopulate<T>(
  entry: CacheManifestEntry,
  policy: ReturnType<typeof getPolicy>,
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  const provider = getProvider();
  const lockKey = `fetch:${entry.key}`;

  const ownerToken = await acquireLockWithBackoff(lockKey, DEFAULT_LOCK_TTL_MS);

  if (!ownerToken) {
    try {
      const raw = await provider.get(entry.key);
      if (raw !== null) {
        const envelope = decode<T>(raw);
        return envelope.negative ? null : envelope.payload;
      }
    } catch {
      recordFailure();
    }
    dbFallbackCounter.inc();
    return executeFetcher(entry.key, fetcher);
  }

  try {
    const result = await executeFetcher(entry.key, fetcher);
    await setWithCache(entry, result);
    recordSuccess();
    return result;
  } finally {
    await releaseLock(lockKey, ownerToken).catch(() => {});
  }
}

function triggerBackgroundRefresh<T>(
  entry: CacheManifestEntry,
  policy: ReturnType<typeof getPolicy>,
  fetcher: () => Promise<T | null>
): void {
  const refreshLockKey = `refresh:${entry.key}`;

  void (async () => {
    const ownerToken = await acquireLock(refreshLockKey, DEFAULT_LOCK_TTL_MS);
    if (!ownerToken) return;

    try {
      const result = await executeFetcher(entry.key, fetcher);
      await setWithCache(entry, result);
    } catch {
      // Ignored
    } finally {
      await releaseLock(refreshLockKey, ownerToken).catch(() => {});
    }
  })();
}

async function executeFetcher<T>(
  key: string,
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  const start = Date.now();
  try {
    return await instrumentExecution(`Fetcher.${key}`, 'DATABASE', async () => {
      return await fetcher();
    });
  } finally {
    recordFetcherLatency(Date.now() - start);
  }
}

// ---------------------------------------------------------------------------
// Batch Operations
// ---------------------------------------------------------------------------

export async function getMany(
  entries: CacheManifestEntry[]
): Promise<(any | null)[]> {
  if (entries.length === 0 || !isCircuitClosed())
    return entries.map(() => null);
  const provider = getProvider();
  try {
    const keys = entries.map((e) => e.key);
    const rawValues = await provider.mget(keys);
    return rawValues.map((raw) => {
      if (!raw) return null;
      const envelope = decode(raw);
      return envelope.negative ? null : envelope.payload;
    });
  } catch {
    return entries.map(() => null);
  }
}

export async function setMany(
  entriesWithPayloads: { entry: CacheManifestEntry; payload: any }[]
): Promise<void> {
  if (entriesWithPayloads.length === 0 || !isCircuitClosed()) return;
  // Use parallel setWithCache to ensure TTLs and tags are applied correctly
  await Promise.all(
    entriesWithPayloads.map((item) => setWithCache(item.entry, item.payload))
  );
}

export async function fetchMany<T>(
  entries: CacheManifestEntry[],
  fetchers: (() => Promise<T | null>)[]
): Promise<(T | null)[]> {
  if (entries.length === 0) return [];
  if (!isCircuitClosed()) {
    dbFallbackCounter.inc(entries.length);
    return Promise.all(
      entries.map((entry, i) => executeFetcher(entry.key, fetchers[i]))
    );
  }

  const results: (T | null)[] = new Array(entries.length).fill(null);
  const provider = getProvider();

  try {
    const keys = entries.map((e) => e.key);
    const rawValues = await provider.mget(keys);
    const misses: {
      index: number;
      entry: CacheManifestEntry;
      fetcher: () => Promise<T | null>;
    }[] = [];

    rawValues.forEach((raw, i) => {
      const entry = entries[i];
      if (raw !== null) {
        const envelope = decode<T>(raw);
        if (envelope.negative) {
          results[i] = null;
        } else {
          results[i] = envelope.payload;

          // SWR check
          const policy = getPolicy(entry);
          const now = Math.floor(Date.now() / 1000);
          const age = now - envelope.createdAt;
          const freshThreshold = policy.ttl - policy.staleWindow;
          if (
            policy.staleWindow > 0 &&
            age >= freshThreshold &&
            age < policy.ttl
          ) {
            triggerBackgroundRefresh(entry, policy, fetchers[i]);
          }
        }
      } else {
        misses.push({ index: i, entry, fetcher: fetchers[i] });
      }
    });

    if (misses.length > 0) {
      // For misses, we use standard fetchWithCache to handle locking and stampede protection properly
      const fetchedResults = await Promise.all(
        misses.map((miss) => fetchWithCache(miss.entry, miss.fetcher))
      );

      misses.forEach((miss, i) => {
        results[miss.index] = fetchedResults[i];
      });
    }

    return results;
  } catch {
    // Fallback to fetchWithCache for everything
    return Promise.all(
      entries.map((entry, i) => fetchWithCache(entry, fetchers[i]))
    );
  }
}
