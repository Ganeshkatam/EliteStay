import { instrumentExecution } from './instrumentation';
import { cacheHitCounter, cacheMissCounter } from '../metrics/counters';
import { SpanMetadata } from '../types/observability.types';

export type CacheOperation = 'HIT' | 'MISS' | 'WRITE' | 'INVALIDATE' | 'EXPIRE';

/**
 * Higher-order function to instrument cache interactions.
 * Records hit rates, latency, and keys without polluting application code.
 */
export async function observeCache<T>(
  cacheKey: string,
  operation: CacheOperation,
  fn: () => Promise<T> | T,
  tags?: Record<string, string>
): Promise<T> {
  const metadata: SpanMetadata = {
    cacheKey,
    cacheStatus: operation,
    tags,
  };

  if (operation === 'HIT') {
    cacheHitCounter.inc();
  } else if (operation === 'MISS') {
    cacheMissCounter.inc();
  }

  return instrumentExecution(`Cache.${operation}`, 'CACHE', fn, metadata);
}
