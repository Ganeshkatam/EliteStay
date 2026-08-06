/**
 * MemoryProvider -- CacheProvider implementation backed by an in-memory Map.
 *
 * Used for:
 *  - Unit and integration tests (no external dependencies).
 *  - Local development when Redis credentials are not configured.
 *
 * Supports TTL via lazy expiration checks.
 */

import type { CacheProvider } from './cache-provider';

interface MemoryEntry {
  value: string;
  expiresAt: number; // Date.now() + ttl
}

export class MemoryProvider implements CacheProvider {
  private readonly store = new Map<string, MemoryEntry>();
  private readonly sets = new Map<string, Set<string>>();

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------

  private isExpired(entry: MemoryEntry): boolean {
    return Date.now() >= entry.expiresAt;
  }

  private getEntry(key: string): MemoryEntry | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  // -------------------------------------------------------------------
  // CacheProvider implementation
  // -------------------------------------------------------------------

  async get(key: string): Promise<string | null> {
    const entry = this.getEntry(key);
    return entry?.value ?? null;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(...keys: string[]): Promise<void> {
    for (const key of keys) {
      this.store.delete(key);
    }
  }

  async exists(key: string): Promise<boolean> {
    return this.getEntry(key) !== null;
  }

  async setnx(key: string, value: string, ttlMs: number): Promise<boolean> {
    if (this.getEntry(key) !== null) return false;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    return true;
  }

  async ping(): Promise<boolean> {
    return true;
  }

  async incr(key: string): Promise<number> {
    const entry = this.getEntry(key);
    const current = entry ? parseInt(entry.value, 10) || 0 : 0;
    const next = current + 1;
    if (entry) {
      entry.value = String(next);
    } else {
      // No TTL context -- set a long default
      this.store.set(key, {
        value: String(next),
        expiresAt: Date.now() + 86_400_000, // 24 hours
      });
    }
    return next;
  }

  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return -2;
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return -2;
    }
    return Math.ceil((entry.expiresAt - Date.now()) / 1000);
  }

  // -------------------------------------------------------------------
  // Batch Operations
  // -------------------------------------------------------------------

  async mget(keys: string[]): Promise<(string | null)[]> {
    return keys.map((key) => {
      const entry = this.getEntry(key);
      return entry?.value ?? null;
    });
  }

  async mset(entries: Record<string, string>): Promise<void> {
    const expiresAt = Date.now() + 86_400_000; // default 24h for batch without explicit ttl
    for (const [key, value] of Object.entries(entries)) {
      this.store.set(key, { value, expiresAt });
    }
  }

  // -------------------------------------------------------------------
  // Set Operations
  // -------------------------------------------------------------------

  async sadd(key: string, ...members: string[]): Promise<number> {
    if (!this.sets.has(key)) {
      this.sets.set(key, new Set());
    }
    const set = this.sets.get(key)!;
    let added = 0;
    for (const m of members) {
      if (!set.has(m)) {
        set.add(m);
        added++;
      }
    }
    return added;
  }

  async smembers(key: string): Promise<string[]> {
    const set = this.sets.get(key);
    return set ? Array.from(set) : [];
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    const set = this.sets.get(key);
    if (!set) return 0;
    let removed = 0;
    for (const m of members) {
      if (set.has(m)) {
        set.delete(m);
        removed++;
      }
    }
    if (set.size === 0) {
      this.sets.delete(key);
    }
    return removed;
  }

  // -------------------------------------------------------------------
  // Test utilities
  // -------------------------------------------------------------------

  /** Clear all entries. Useful in test teardown. */
  clear(): void {
    this.store.clear();
    this.sets.clear();
  }

  /** Return the number of live (non-expired) entries. */
  size(): number {
    let count = 0;
    for (const [key, entry] of this.store) {
      if (this.isExpired(entry)) {
        this.store.delete(key);
      } else {
        count++;
      }
    }
    return count;
  }
}
