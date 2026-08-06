/**
 * Serializer -- abstraction for encoding/decoding cache payloads.
 *
 * Supports a standardized cache entry envelope with metadata for
 * SWR, debugging, metrics, and negative caching.
 *
 * Compression is applied only when the serialized payload exceeds
 * COMPRESSION_THRESHOLD_BYTES (default 4KB) using Node's built-in Brotli.
 */

import { brotliCompressSync, brotliDecompressSync } from 'zlib';
import { COMPRESSION_THRESHOLD_BYTES, ENVELOPE_VERSION } from './config';

// ---------------------------------------------------------------------------
// Serializer interface (swap JSON -> MessagePack later)
// ---------------------------------------------------------------------------

export interface PayloadSerializer {
  serialize(value: unknown): string;
  deserialize<T>(raw: string): T;
}

/** Default JSON serializer. */
export const JsonSerializer: PayloadSerializer = {
  serialize: (value: unknown) => JSON.stringify(value),
  deserialize: <T>(raw: string) => JSON.parse(raw) as T,
};

// Active serializer -- change this one line to switch to MessagePack.
const activeSerializer: PayloadSerializer = JsonSerializer;

// ---------------------------------------------------------------------------
// Cache Entry Envelope
// ---------------------------------------------------------------------------

export interface CacheEnvelope<T = unknown> {
  /** Envelope schema version. */
  version: number;
  /** Unix timestamp (seconds) when the entry was created. */
  createdAt: number;
  /** Original TTL in seconds (before jitter). */
  ttl: number;
  /** Whether the payload was Brotli-compressed. */
  compressed: boolean;
  /** Whether this entry represents a negative cache (404, empty, etc.). */
  negative: boolean;
  /** The actual data, or `null` for negative cache entries. */
  payload: T | null;
}

// ---------------------------------------------------------------------------
// Encode / Decode
// ---------------------------------------------------------------------------

/**
 * Encode a value into a storable string, wrapping it in a standardized envelope.
 *
 * @param payload   The data to cache (or `null` for negative caching).
 * @param ttl       The TTL in seconds (stored in envelope for SWR calculations).
 * @param negative  Whether this is a negative cache entry.
 */
export function encode<T>(
  payload: T | null,
  ttl: number,
  negative: boolean = false,
  disableCompression: boolean = false
): string {
  const envelope: CacheEnvelope<T> = {
    version: ENVELOPE_VERSION,
    createdAt: Math.floor(Date.now() / 1000),
    ttl,
    compressed: false,
    negative,
    payload,
  };

  const serialized = activeSerializer.serialize(envelope);

  // Compress only if payload exceeds threshold and compression is not disabled
  if (!disableCompression && serialized.length > COMPRESSION_THRESHOLD_BYTES) {
    const compressed = brotliCompressSync(Buffer.from(serialized));
    // Store as base64 with a prefix marker so decode knows it is compressed.
    return `__br__${compressed.toString('base64')}`;
  }

  return serialized;
}

/**
 * Decode a stored string back into a CacheEnvelope.
 * Handles both compressed and raw entries.
 */
export function decode<T>(raw: string): CacheEnvelope<T> {
  let json: string;

  if (raw.startsWith('__br__')) {
    // Brotli-compressed entry
    const compressed = Buffer.from(raw.slice(6), 'base64');
    json = brotliDecompressSync(compressed).toString();
  } else {
    json = raw;
  }

  const envelope = activeSerializer.deserialize<CacheEnvelope<T>>(json);

  // Future-proof: if the envelope version changes, handle migration here.
  if (envelope.version !== ENVELOPE_VERSION) {
    // For now, treat incompatible versions as cache misses.
    return {
      version: ENVELOPE_VERSION,
      createdAt: 0,
      ttl: 0,
      compressed: false,
      negative: false,
      payload: null,
    };
  }

  return envelope;
}

/**
 * Check whether a cached envelope is within the stale window.
 *
 * @param envelope       The cached entry.
 * @param staleFraction  Fraction of TTL that defines the stale window (e.g. 0.2 = last 20%).
 * @returns              `true` if the entry is stale but still within TTL.
 */
export function isStale<T>(
  envelope: CacheEnvelope<T>,
  staleFraction: number
): boolean {
  const now = Math.floor(Date.now() / 1000);
  const age = now - envelope.createdAt;
  const freshThreshold = envelope.ttl * (1 - staleFraction);
  return age >= freshThreshold && age < envelope.ttl;
}
