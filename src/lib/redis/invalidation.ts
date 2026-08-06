import { getProvider } from './client';
import { isCircuitClosed } from './circuit-breaker';
import { recordInvalidate } from './metrics';

export async function invalidateTag(tag: string): Promise<void> {
  if (!isCircuitClosed()) return;

  const provider = getProvider();
  const tagKey = `tag:${tag}`;

  await recordInvalidate(tag, async () => {
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
  await provider.srem(`tag:${tag}`, key);
}

// ---------------------------------------------------------------------------
// Legacy Search Versioning (Migrating to tags)
// ---------------------------------------------------------------------------

const SEARCH_VERSION_KEY = 'elitestay:v1:search:version';

export async function invalidateSearchNamespace(): Promise<void> {
  if (!isCircuitClosed()) return;
  const provider = getProvider();
  await recordInvalidate('search:version', () =>
    provider.incr(SEARCH_VERSION_KEY)
  );
}

export async function getSearchVersion(): Promise<number> {
  if (!isCircuitClosed()) return 0;
  const provider = getProvider();
  try {
    const raw = await provider.get(SEARCH_VERSION_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}
