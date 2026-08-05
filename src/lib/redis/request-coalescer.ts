/**
 * Request Coalescer -- in-process promise deduplication.
 *
 * When multiple requests on the SAME Node.js instance ask for the same
 * cache key simultaneously, only one executes the fetcher. All others
 * await the same Promise.
 *
 * This eliminates redundant Redis and DB operations within a single server,
 * complementing the distributed lock that handles cross-instance stampedes.
 */

const inflight = new Map<string, Promise<unknown>>();

/**
 * Coalesce concurrent requests for the same key into a single execution.
 *
 * @param key     The cache key being requested.
 * @param fn      The function to execute if no in-flight request exists.
 * @returns       The result from either the new or existing in-flight execution.
 */
export async function coalesce<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fn().finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, promise);
  return promise;
}

/**
 * Check if a request for this key is currently in-flight.
 * Useful for diagnostics and testing.
 */
export function isInFlight(key: string): boolean {
  return inflight.has(key);
}

/**
 * Return the number of currently in-flight requests.
 * Useful for diagnostics.
 */
export function inflightCount(): number {
  return inflight.size;
}
