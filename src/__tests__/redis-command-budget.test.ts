import { describe, it, expect, beforeEach } from 'vitest';
import { CacheProvider } from '@/lib/redis/providers/cache-provider';
import { MemoryProvider } from '@/lib/redis/providers/memory-provider';
import { _setProviderForTesting } from '@/lib/redis/client';
import { Cache } from '@/lib/redis/facade';
import { CacheManifest } from '@/lib/redis/manifest';
import { acquireLock, releaseLock } from '@/lib/redis/locks';
import { setWithCache, fetchWithCache } from '@/lib/redis/cache';
import { SearchService } from '@/features/search/services/SearchService';
import { HomeService } from '@/features/guest/discovery/home/services/HomeService';
import { coalesce } from '@/lib/redis/request-coalescer';

class InstrumentedProvider implements CacheProvider {
  private base = new MemoryProvider();
  public ops: Record<string, number> = {
    get: 0,
    set: 0,
    del: 0,
    exists: 0,
    setnx: 0,
    compareAndDelete: 0,
    ping: 0,
    incr: 0,
    ttl: 0,
    mget: 0,
    mset: 0,
    sadd: 0,
    smembers: 0,
    srem: 0,
  };

  reset() {
    Object.keys(this.ops).forEach((k) => {
      this.ops[k] = 0;
    });
  }

  async get(key: string): Promise<string | null> {
    this.ops.get++;
    return this.base.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.ops.set++;
    return this.base.set(key, value, ttlSeconds);
  }

  async del(...keys: string[]): Promise<void> {
    this.ops.del += keys.length;
    return this.base.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    this.ops.exists++;
    return this.base.exists(key);
  }

  async setnx(key: string, value: string, ttlMs: number): Promise<boolean> {
    this.ops.setnx++;
    return this.base.setnx(key, value, ttlMs);
  }

  async compareAndDelete(key: string, expectedValue: string): Promise<boolean> {
    this.ops.compareAndDelete++;
    return this.base.compareAndDelete(key, expectedValue);
  }

  async ping(): Promise<boolean> {
    this.ops.ping++;
    return this.base.ping();
  }

  async incr(key: string): Promise<number> {
    this.ops.incr++;
    return this.base.incr(key);
  }

  async ttl(key: string): Promise<number> {
    this.ops.ttl++;
    return this.base.ttl(key);
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    this.ops.mget++;
    return this.base.mget(keys);
  }

  async mset(entries: Record<string, string>): Promise<void> {
    this.ops.mset++;
    return this.base.mset(entries);
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    this.ops.sadd += members.length;
    return this.base.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    this.ops.smembers++;
    return this.base.smembers(key);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    this.ops.srem += members.length;
    return this.base.srem(key, ...members);
  }
}

describe('Redis Command Budget & Architecture', () => {
  let provider: InstrumentedProvider;

  beforeEach(() => {
    provider = new InstrumentedProvider();
    _setProviderForTesting(provider);
  });

  describe('Foreground Read Budget', () => {
    it('hot homepage foreground request executes exactly 1 Redis GET and 0 SADDs', async () => {
      // Prime homepage snapshot cache
      const mockSnapshot = {
        title: 'Find your next place to live',
        categories: [],
        sections: [],
        locations: [],
      };
      await Cache.set(CacheManifest.homeSnapshot(1), mockSnapshot);

      provider.reset();

      // Execute homepage retrieval
      const result = await HomeService.getHomeSnapshot();

      expect(result).toBeDefined();
      expect(provider.ops.get).toBe(1);
      expect(provider.ops.sadd).toBe(0);
      expect(provider.ops.set).toBe(0);
    });

    it('hot search data request executes at most 1 Redis GET and 0 SADDs', async () => {
      // Prime search version in Redis provider and populate L1 in-process cache
      await provider.set('elitestay:v1:search:version', '1', 60);
      await Cache.getSearchVersion(); // Populates process-local L1 cache

      const filters = {
        city: 'mumbai',
        locality: null,
        minLat: null,
        maxLat: null,
        minLng: null,
        maxLng: null,
        centerLat: null,
        centerLng: null,
        minPrice: null,
        maxPrice: null,
        accommodationType: null,
        furnishing: null,
        genderPreference: null,
        occupancyType: null,
        billingPeriod: null,
        amenities: [],
        availableFrom: null,
        sort: 'recommended' as const,
        page: 1,
        pageSize: 10,
      };

      // Prime search results in Redis cache with exact SearchService cache params
      const cacheParams: Record<string, unknown> = {
        city: filters.city,
        locality: filters.locality,
        accommodationType: filters.accommodationType,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        furnishing: filters.furnishing,
        genderPreference: filters.genderPreference,
        occupancyType: filters.occupancyType,
        billingPeriod: filters.billingPeriod,
        amenities: filters.amenities,
        availableFrom: filters.availableFrom,
        sort: filters.sort,
        page: filters.page,
        pageSize: filters.pageSize,
      };
      await Cache.set(CacheManifest.searchListings(1, cacheParams), {
        listings: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });

      provider.reset();

      // Hot call: version hits L1 memory (0 Redis GETs), search result hits Redis (1 Redis GET)
      const result = await SearchService.search(filters);

      expect(result).toBeDefined();
      expect(provider.ops.get).toBe(1);
      expect(provider.ops.sadd).toBe(0);
    });
  });

  describe('Invalidation Strategy & Tag Removal', () => {
    it('versioned cache write for search issues 0 SADD commands', async () => {
      provider.reset();

      const entry = CacheManifest.searchListings(1, { city: 'bangalore' });
      await setWithCache(entry, { listings: [], total: 0 });

      expect(provider.ops.set).toBe(1);
      expect(provider.ops.sadd).toBe(0);
    });

    it('versioned cache write for homepage snapshot issues 0 SADD commands', async () => {
      provider.reset();

      const entry = CacheManifest.homeSnapshot(1);
      await setWithCache(entry, { title: 'Test' });

      expect(provider.ops.set).toBe(1);
      expect(provider.ops.sadd).toBe(0);
    });

    it('tag-invalidated cache write for property applies tags via SADD', async () => {
      provider.reset();

      const entry = CacheManifest.propertyBase('prop-123');
      await setWithCache(entry, { id: 'prop-123' });

      expect(provider.ops.set).toBe(1);
      expect(provider.ops.sadd).toBeGreaterThan(0);
    });
  });

  describe('Lock Lifecycle', () => {
    it('lock release uses atomic compareAndDelete instead of GET + DEL', async () => {
      const resourceKey = 'test-resource';
      const token = await acquireLock(resourceKey, 5000);
      expect(token).toBeTruthy();

      provider.reset();

      await releaseLock(resourceKey, token!);

      // Assert 1 atomic compareAndDelete (EVAL on Redis), 0 GETs and 0 DELs
      expect(provider.ops.compareAndDelete).toBe(1);
      expect(provider.ops.get).toBe(0);
      expect(provider.ops.del).toBe(0);
    });
  });

  describe('Request Coalescing & Negative Caching', () => {
    it('coalesces concurrent requests for the same key into a single execution', async () => {
      let callCount = 0;
      const fn = async () => {
        callCount++;
        await new Promise((resolve) => setTimeout(resolve, 30));
        return 'success';
      };

      const results = await Promise.all([
        coalesce('coalesce-test-key', fn),
        coalesce('coalesce-test-key', fn),
        coalesce('coalesce-test-key', fn),
        coalesce('coalesce-test-key', fn),
      ]);

      expect(results).toEqual(['success', 'success', 'success', 'success']);
      expect(callCount).toBe(1);
    });

    it('negative cache writes at most once per cold miss', async () => {
      provider.reset();

      const entry = CacheManifest.searchListings(1, {
        city: 'nonexistent-city',
      });
      const fetcher = async () => null;

      await fetchWithCache(entry, fetcher);

      // Should write negative cache entry exactly once
      expect(provider.ops.set).toBe(1);
    });
  });
});
