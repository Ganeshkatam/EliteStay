const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

// Global cache for Next.js to persist across hot reloads in dev and between requests in serverless functions (to some extent)
const globalForRateLimiter = globalThis as unknown as {
  rateLimits: Map<string, RateLimitEntry>;
};

const rateLimits =
  globalForRateLimiter.rateLimits || new Map<string, RateLimitEntry>();
if (process.env.NODE_ENV !== 'production')
  globalForRateLimiter.rateLimits = rateLimits;

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
