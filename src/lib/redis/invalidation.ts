import { getProvider } from './client';
import { isCircuitClosed, recordFailure } from './circuit-breaker';
import { recordInvalidate } from './metrics';

export async function invalidateTag(tag: string): Promise<void> {
  if (!isCircuitClosed()) return;

  const provider = getProvider();
  const tagKey = `tag:${tag}`;

  await recordInvalidate(tag, async () => {
    try {
      // 1. Get all keys associated with this tag
      const keys = await provider.smembers(tagKey);

      if (keys.length > 0) {
        // 2. Delete all the actual cache keys
        await provider.del(...keys);

        // 3. (Automatic Cleanup) - The keys are now gone. To prevent stale tag
        // memberships, we also delete the tag set itself.
        // Next time a key is cached with this tag, the set will be recreated.
        await provider.del(tagKey);
      }
    } catch (err) {
      console.warn(`[Redis] Failed to invalidate tag ${tag}:`, err);
      recordFailure();
    }
  });
}

/**
 * Advanced cleanup: Explicitly remove a key from a tag's set.
 * Called when a key naturally expires or is explicitly deleted individually.
 */
export async function removeKeyFromTag(
  key: string,
  tag: string
): Promise<void> {
  if (!isCircuitClosed()) return;
  const provider = getProvider();
  try {
    await provider.srem(`tag:${tag}`, key);
  } catch (err) {
    console.warn(`[Redis] Failed to remove key from tag ${tag}:`, err);
    recordFailure();
  }
}

// ---------------------------------------------------------------------------
// Search Versioning with L1 In-Process Coalesced Cache
//
// INVARIANT: Search cache propagation latency across multiple application
// instances is bounded to at most 5 seconds.
// ---------------------------------------------------------------------------

const SEARCH_VERSION_KEY = 'elitestay:v1:search:version';
const VERSION_CACHE_TTL_MS = 5000; // 5-second process-local TTL

let localSearchVersion: { version: number; expiresAt: number } | null = null;
let inflightVersionPromise: Promise<number> | null = null;

export async function invalidateSearchNamespace(): Promise<void> {
  // Clear local memory cache immediately upon local invalidation
  localSearchVersion = null;

  if (!isCircuitClosed()) return;
  const provider = getProvider();
  try {
    await recordInvalidate('search:version', () =>
      provider.incr(SEARCH_VERSION_KEY)
    );
  } catch (err) {
    console.warn('[Redis] Failed to invalidate search namespace:', err);
    recordFailure();
  }
}

export async function getSearchVersion(): Promise<number> {
  const now = Date.now();

  // 1. L1 Memory Hit
  if (localSearchVersion && now < localSearchVersion.expiresAt) {
    return localSearchVersion.version;
  }

  // 2. Coalesce concurrent in-process requests on L1 miss/expiry
  if (inflightVersionPromise) {
    return inflightVersionPromise;
  }

  inflightVersionPromise = (async () => {
    if (!isCircuitClosed()) {
      return localSearchVersion ? localSearchVersion.version : 0;
    }

    const provider = getProvider();
    try {
      const raw = await provider.get(SEARCH_VERSION_KEY);
      const version = raw ? parseInt(raw, 10) : 0;
      localSearchVersion = {
        version,
        expiresAt: Date.now() + VERSION_CACHE_TTL_MS,
      };
      return version;
    } catch (err) {
      console.warn('[Redis] Failed to get search version:', err);
      recordFailure();
      return localSearchVersion ? localSearchVersion.version : 0;
    } finally {
      inflightVersionPromise = null;
    }
  })();

  return inflightVersionPromise;
}
