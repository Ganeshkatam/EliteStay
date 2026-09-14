/**
 * Distributed Locks with Owner Tokens.
 *
 * Prevents cache stampedes across multiple server instances.
 * Uses exponential backoff (not polling) when waiting for a lock.
 *
 * Safety guarantees:
 *  - Owner token ensures only the lock holder can release.
 *  - PX expiry prevents deadlocks if the holder crashes.
 *  - Compare-and-delete on release prevents releasing another process's lock.
 */

import { getProvider } from './client';
import { recordFailure } from './circuit-breaker';
import { KEY_PREFIX } from './config';
import {
  DEFAULT_LOCK_TTL_MS,
  LOCK_MAX_RETRIES,
  LOCK_INITIAL_BACKOFF_MS,
} from './config';

/** Generate a unique owner token for this lock acquisition. */
function generateOwnerToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Attempt to acquire a distributed lock.
 *
 * @param resourceKey  The resource being locked (will be prefixed with lock namespace).
 * @param ttlMs        Lock expiration in milliseconds (safety net).
 * @returns            The owner token if acquired, `null` otherwise.
 */
export async function acquireLock(
  resourceKey: string,
  ttlMs: number = DEFAULT_LOCK_TTL_MS
): Promise<string | null> {
  const provider = getProvider();
  const token = generateOwnerToken();
  const lockKey = `${KEY_PREFIX}lock:${resourceKey}`;

  try {
    const acquired = await provider.setnx(lockKey, token, ttlMs);
    return acquired ? token : null;
  } catch (err) {
    console.warn(`[Redis] Failed to acquire lock ${resourceKey}:`, err);
    recordFailure();
    return null;
  }
}

/**
 * Release a distributed lock, but only if the caller owns it.
 *
 * Compare-and-delete: reads the stored value and deletes only if
 * it matches the provided owner token.
 */
export async function releaseLock(
  resourceKey: string,
  token: string
): Promise<void> {
  const provider = getProvider();
  const lockKey = `${KEY_PREFIX}lock:${resourceKey}`;

  try {
    await provider.compareAndDelete(lockKey, token);
  } catch (err) {
    console.warn(`[Redis] Failed to release lock ${resourceKey}:`, err);
    recordFailure();
  }
}

/**
 * Acquire a lock with exponential backoff retries.
 *
 * @param resourceKey   The resource being locked.
 * @param ttlMs         Lock expiration in milliseconds.
 * @param maxRetries    Maximum backoff retries.
 * @param initialDelay  Initial backoff delay in milliseconds.
 * @returns             The owner token if acquired, `null` if all retries exhausted.
 */
export async function acquireLockWithBackoff(
  resourceKey: string,
  ttlMs: number = DEFAULT_LOCK_TTL_MS,
  maxRetries: number = LOCK_MAX_RETRIES,
  initialDelay: number = LOCK_INITIAL_BACKOFF_MS
): Promise<string | null> {
  // First attempt (no delay)
  const token = await acquireLock(resourceKey, ttlMs);
  if (token) return token;

  // Exponential backoff retries
  let delay = initialDelay;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    await sleep(delay);
    const retryToken = await acquireLock(resourceKey, ttlMs);
    if (retryToken) return retryToken;
    delay = Math.min(delay * 2, 2000); // Cap at 2 seconds
  }

  return null;
}

/**
 * Execute a function while holding a distributed lock.
 *
 * @param resourceKey  The resource being locked.
 * @param ttlMs        Lock expiration in milliseconds.
 * @param fn           The function to execute while holding the lock.
 * @returns            The result of `fn`, or `null` if the lock could not be acquired.
 */
export async function withLock<T>(
  resourceKey: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T | null> {
  const ownerToken = await acquireLock(resourceKey, ttlMs);
  if (!ownerToken) return null;

  try {
    return await fn();
  } finally {
    await releaseLock(resourceKey, ownerToken);
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
