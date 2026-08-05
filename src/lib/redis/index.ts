/**
 * Redis Distributed State Layer -- Public API.
 *
 * This barrel file is the only import needed by feature code:
 *
 *   import { fetchWithCache, CacheKeys, TTL, CacheInvalidation } from '@/lib/redis';
 */

// Core cache engine
export { fetchWithCache } from './cache';
export type { FetchWithCacheOptions } from './cache';

// Key builder
export { CacheKeys } from './keys';

// TTL utilities
export { withJitter } from './ttl';
export { TTL } from './config';

// Invalidation service
export { CacheInvalidation } from './invalidation';

// Health check
export { isHealthy } from './health';
export type { RedisHealthStatus } from './health';

// Provider (for tests and advanced usage)
export type { CacheProvider } from './providers/cache-provider';
export { getProvider, getProviderType, _setProviderForTesting } from './client';
