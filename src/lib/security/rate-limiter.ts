import { getProvider } from '@/lib/redis/client';
import { isCircuitClosed } from '@/lib/redis/circuit-breaker';

const WINDOW_MS = 60 * 1000; // 1 minute
const WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 20;

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

// Global cache for Next.js to persist across hot reloads in dev and between requests in serverless functions
const globalForRateLimiter = globalThis as unknown as {
  rateLimits: Map<string, RateLimitEntry>;
};

const rateLimits =
  globalForRateLimiter.rateLimits || new Map<string, RateLimitEntry>();
if (process.env.NODE_ENV !== 'production')
  globalForRateLimiter.rateLimits = rateLimits;

/**
 * Synchronous local memory rate limiter.
 */
export function checkRateLimit(
  userId: string,
  actionName: string
): { success: boolean; resetTime: number } {
  const key = `${userId}:${actionName}`;
  const now = Date.now();
  let entry = rateLimits.get(key);

  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + WINDOW_MS };
  }

  entry.count++;
  rateLimits.set(key, entry);

  return {
    success: entry.count <= MAX_REQUESTS_PER_WINDOW,
    resetTime: entry.resetTime,
  };
}

/**
 * Distributed rate limiter using atomic Redis operations when available,
 * falling back gracefully to process-local sliding window memory rate limiter.
 */
export async function checkRateLimitAsync(
  userId: string,
  actionName: string
): Promise<{ success: boolean; resetTime: number }> {
  const now = Date.now();
  const windowIndex = Math.floor(now / WINDOW_MS);
  const redisKey = `ratelimit:${userId}:${actionName}:${windowIndex}`;

  try {
    if (isCircuitClosed()) {
      const provider = getProvider();
      const currentCount = await provider.incr(redisKey);

      if (currentCount === 1) {
        // Set TTL on key for expiry
        await provider.set(redisKey, '1', WINDOW_SECONDS * 2);
      }

      const resetTime = (windowIndex + 1) * WINDOW_MS;
      return {
        success: currentCount <= MAX_REQUESTS_PER_WINDOW,
        resetTime,
      };
    }
  } catch (error) {
    console.warn(
      '[RateLimiter] Redis rate limiting failed, using memory fallback:',
      error
    );
  }

  return checkRateLimit(userId, actionName);
}
