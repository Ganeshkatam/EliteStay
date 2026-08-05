/**
 * Redis Client -- Singleton provider factory.
 *
 * Resolves the CacheProvider implementation at startup:
 *  - Upstash when UPSTASH_REDIS_REST_URL + TOKEN are present.
 *  - MemoryProvider in development / tests when credentials are missing.
 *
 * Feature code imports `getProvider()` -- never a concrete class.
 */

import type { CacheProvider } from './providers/cache-provider';
import { UpstashProvider } from './providers/upstash-provider';
import { MemoryProvider } from './providers/memory-provider';

import { IoRedisProvider } from './providers/ioredis-provider';

// ---------------------------------------------------------------------------
// Environment resolution
// ---------------------------------------------------------------------------

interface RedisEnv {
  url: string;
  token: string;
}

function resolveUpstashEnv(): RedisEnv | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  // Basic validation
  try {
    new URL(url);
  } catch {
    console.warn(
      '[Redis] UPSTASH_REDIS_REST_URL is not a valid URL. Falling back to MemoryProvider.'
    );
    return null;
  }

  if (token.length < 10) {
    console.warn(
      '[Redis] UPSTASH_REDIS_REST_TOKEN appears malformed. Falling back to MemoryProvider.'
    );
    return null;
  }

  return { url, token };
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _provider: CacheProvider | null = null;
let _providerType: 'upstash' | 'memory' | 'ioredis' = 'memory';

/**
 * Returns the active CacheProvider singleton.
 * Lazily initialized on first call.
 */
export function getProvider(): CacheProvider {
  if (_provider) return _provider;

  const upstashEnv = resolveUpstashEnv();
  const ioRedisUrl = process.env.REDIS_URL;

  if (ioRedisUrl) {
    _provider = new IoRedisProvider(ioRedisUrl);
    _providerType = 'ioredis';
    console.info('[Redis] Initialized IoRedisProvider (Self-Hosted Redis).');
  } else if (upstashEnv) {
    _provider = new UpstashProvider(upstashEnv.url, upstashEnv.token);
    _providerType = 'upstash';
    console.info('[Redis] Initialized UpstashProvider.');
  } else {
    _provider = new MemoryProvider();
    _providerType = 'memory';
    console.info(
      '[Redis] Redis credentials not found. Using in-memory MemoryProvider.'
    );
  }

  return _provider;
}

/** Returns the name of the active provider for diagnostics. */
export function getProviderType(): 'upstash' | 'memory' | 'ioredis' {
  return _providerType;
}

/**
 * Replace the active provider. Intended for tests only.
 * @internal
 */
export function _setProviderForTesting(provider: CacheProvider): void {
  _provider = provider;
}
