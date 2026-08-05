/**
 * Redis Cache Metrics -- pluggable via the existing Observability Platform.
 *
 * No console.log in the cache layer. Today metrics flow through the
 * console exporter; tomorrow through OpenTelemetry/Datadog/Prometheus
 * without changing cache code.
 */

import { observeCache } from '@/lib/observability';
import { MetricCounter, MetricHistogram } from '@/lib/observability';

// ---------------------------------------------------------------------------
// Dedicated cache counters
// ---------------------------------------------------------------------------

export const cacheSetCounter = new MetricCounter(
  'cache_set_total',
  'Total cache write operations'
);

export const cacheDeleteCounter = new MetricCounter(
  'cache_delete_total',
  'Total cache invalidation operations'
);

export const cacheStaleServeCounter = new MetricCounter(
  'cache_stale_serve_total',
  'Total stale-while-revalidate serves'
);

export const dbFallbackCounter = new MetricCounter(
  'cache_db_fallback_total',
  'Total times Redis was bypassed and DB was queried directly'
);

// ---------------------------------------------------------------------------
// Dedicated cache latency histograms
// ---------------------------------------------------------------------------

export const cacheLatencyHistogram = new MetricHistogram(
  'cache_operation_duration_ms',
  'Cache GET/SET operation latency distribution'
);

export const fetcherLatencyHistogram = new MetricHistogram(
  'cache_fetcher_duration_ms',
  'Database fetcher latency when cache misses'
);

// ---------------------------------------------------------------------------
// Instrumented wrappers
// ---------------------------------------------------------------------------

/**
 * Record a cache HIT via the observability platform.
 */
export async function recordHit<T>(
  key: string,
  fn: () => Promise<T> | T
): Promise<T> {
  return observeCache(key, 'HIT', fn);
}

/**
 * Record a cache MISS via the observability platform.
 */
export async function recordMiss<T>(
  key: string,
  fn: () => Promise<T> | T
): Promise<T> {
  return observeCache(key, 'MISS', fn);
}

/**
 * Record a cache WRITE via the observability platform.
 */
export async function recordWrite<T>(
  key: string,
  fn: () => Promise<T> | T
): Promise<T> {
  cacheSetCounter.inc();
  return observeCache(key, 'WRITE', fn);
}

/**
 * Record a cache INVALIDATE via the observability platform.
 */
export async function recordInvalidate<T>(
  key: string,
  fn: () => Promise<T> | T
): Promise<T> {
  cacheDeleteCounter.inc();
  return observeCache(key, 'INVALIDATE', fn);
}

/**
 * Record latency for a cache operation.
 */
export function recordCacheLatency(durationMs: number): void {
  cacheLatencyHistogram.observe(durationMs);
}

/**
 * Record latency for a database fetch triggered by a cache miss.
 */
export function recordFetcherLatency(durationMs: number): void {
  fetcherLatencyHistogram.observe(durationMs);
}
