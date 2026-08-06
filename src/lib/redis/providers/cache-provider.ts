/**
 * CacheProvider -- abstraction over any key-value store.
 *
 * Feature code never touches Upstash, Redis, or any concrete implementation.
 * Swap providers without changing a single line of business logic.
 */

export interface CacheProvider {
  /** Retrieve a raw string value by key. Returns `null` on miss. */
  get(key: string): Promise<string | null>;

  /** Store a raw string value with a TTL (seconds). */
  set(key: string, value: string, ttlSeconds: number): Promise<void>;

  /** Delete one or more keys. */
  del(...keys: string[]): Promise<void>;

  /** Check whether a key exists. */
  exists(key: string): Promise<boolean>;

  /**
   * Set key to value only if it does not already exist.
   * Returns `true` if the key was set (lock acquired), `false` otherwise.
   * @param ttlMs  Automatic expiration in milliseconds.
   */
  setnx(key: string, value: string, ttlMs: number): Promise<boolean>;

  /** Lightweight connectivity check. Returns `true` when the store is reachable. */
  ping(): Promise<boolean>;

  /** Increment a numeric value stored at key. Returns the new value. */
  incr(key: string): Promise<number>;

  /**
   * Get the remaining TTL for a key in seconds.
   * Returns -2 if the key does not exist, -1 if no TTL is set.
   */
  ttl(key: string): Promise<number>;

  // ---------------------------------------------------------------------------
  // Batch Operations
  // ---------------------------------------------------------------------------

  /** Retrieve multiple raw string values. Returns array of strings or nulls. */
  mget(keys: string[]): Promise<(string | null)[]>;

  /** Store multiple raw string values. */
  mset(entries: Record<string, string>): Promise<void>;

  // ---------------------------------------------------------------------------
  // Set Operations (for tags)
  // ---------------------------------------------------------------------------

  /** Add one or more members to a set. */
  sadd(key: string, ...members: string[]): Promise<number>;

  /** Get all members in a set. */
  smembers(key: string): Promise<string[]>;

  /** Remove one or more members from a set. */
  srem(key: string, ...members: string[]): Promise<number>;
}
