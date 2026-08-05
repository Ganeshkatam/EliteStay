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
  // Test utilities
  // -------------------------------------------------------------------

  /** Clear all entries. Useful in test teardown. */
  clear(): void {
    this.store.clear();
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
