/**
 * Centralized Configuration for the EliteStay Redis Distributed State Layer.
 *
 * Every Redis module imports from this single source of truth.
 * Tuning is done here, not scattered across individual files.
 */

// ---------------------------------------------------------------------------
// Namespace & Versioning
// ---------------------------------------------------------------------------

/** Application-wide prefix prevents key collisions in shared Redis clusters. */
export const REDIS_NAMESPACE = 'elitestay';

/** Cache schema version. Bump to instantly orphan all cached entries. */
export const REDIS_SCHEMA_VERSION = 'v1';

/** Builds the full key prefix: `elitestay:v1:` */
export const KEY_PREFIX = `${REDIS_NAMESPACE}:${REDIS_SCHEMA_VERSION}:`;

// ---------------------------------------------------------------------------
// TTL and Jitter
// ---------------------------------------------------------------------------

/** Fraction of TTL used as jitter range. 0.15 = +/- 15%. */
export const TTL_JITTER_FRACTION = 0.15;

// ---------------------------------------------------------------------------
// Compression
// ---------------------------------------------------------------------------

/** Payloads smaller than this (bytes) are stored as raw JSON. */
export const COMPRESSION_THRESHOLD_BYTES = 4096;

// ---------------------------------------------------------------------------
// Stale-While-Revalidate
// ---------------------------------------------------------------------------

/**
 * Fraction of TTL that defines the stale window.
 * 0.2 means the last 20% of TTL is considered stale-but-servable.
 *
 * Example: TTL=300s  -->  Fresh 0-240s, Stale 240-300s.
 */
export const STALE_WINDOW_FRACTION = 0.2;

// ---------------------------------------------------------------------------
// Distributed Locking
// ---------------------------------------------------------------------------

/** Default lock TTL in milliseconds. */
export const DEFAULT_LOCK_TTL_MS = 10_000;

/** Maximum number of backoff retries when waiting for a lock. */
export const LOCK_MAX_RETRIES = 8;

/** Initial backoff delay in milliseconds. Doubles on each retry. */
export const LOCK_INITIAL_BACKOFF_MS = 20;

// ---------------------------------------------------------------------------
// Circuit Breaker
// ---------------------------------------------------------------------------

/** Number of consecutive failures before the circuit opens. */
export const CIRCUIT_FAILURE_THRESHOLD = 5;

/** Milliseconds to wait in OPEN state before probing (HALF_OPEN). */
export const CIRCUIT_COOLDOWN_MS = 30_000;

/** Number of successful probes in HALF_OPEN before closing the circuit. */
export const CIRCUIT_HALF_OPEN_REQUESTS = 1;

// ---------------------------------------------------------------------------
// Cache Entry Envelope
// ---------------------------------------------------------------------------

/** Current envelope schema version. */
export const ENVELOPE_VERSION = 1;
