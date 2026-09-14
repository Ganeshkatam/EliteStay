/**
 * UpstashProvider -- CacheProvider implementation backed by Upstash Redis.
 *
 * This is the **only** file in the codebase that imports from `@upstash/redis`.
 */

import { Redis } from '@upstash/redis';
import type { CacheProvider } from './cache-provider';

export class UpstashProvider implements CacheProvider {
  private readonly client: Redis;

  constructor(url: string, token: string) {
    this.client = new Redis({
      url,
      token,
      retry: {
        retries: 1, // Fail fast to let circuit breaker take over
        backoff: (retryCount) => Math.min(Math.exp(retryCount) * 100, 3000),
      },
    });
  }

  async get(key: string): Promise<string | null> {
    // @upstash/redis automatically parses JSON payloads if they look like JSON.
    // Since our Serializer expects a raw string (to handle both JSON and __br__ prefixed Brotli),
    // we need to re-stringify it if it was auto-parsed.
    const value = await this.client.get<unknown>(key);
    if (value === null || value === undefined) return null;
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, value, { ex: ttlSeconds });
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    const count = await this.client.exists(key);
    return count > 0;
  }

  async setnx(key: string, value: string, ttlMs: number): Promise<boolean> {
    // SET key value NX PX ttlMs -- atomic set-if-not-exists with millisecond expiry
    const result = await this.client.set(key, value, { nx: true, px: ttlMs });
    return result === 'OK';
  }

  async ping(): Promise<boolean> {
    try {
      const response = await this.client.ping();
      return response === 'PONG';
    } catch {
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  // ---------------------------------------------------------------------------
  // Batch Operations
  // ---------------------------------------------------------------------------

  async mget(keys: string[]): Promise<(string | null)[]> {
    if (keys.length === 0) return [];
    const values = await this.client.mget<unknown[]>(...keys);
    return values.map((value) => {
      if (value === null || value === undefined) return null;
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    });
  }

  async mset(entries: Record<string, string>): Promise<void> {
    if (Object.keys(entries).length === 0) return;
    await this.client.mset(entries);
  }

  // ---------------------------------------------------------------------------
  // Set Operations
  // ---------------------------------------------------------------------------

  async sadd(key: string, ...members: string[]): Promise<number> {
    if (members.length === 0) return 0;
    return this.client.sadd(key, members[0], ...members.slice(1));
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    if (members.length === 0) return 0;
    return this.client.srem(key, members[0], ...members.slice(1));
  }
}
