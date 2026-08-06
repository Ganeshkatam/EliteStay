import { NextResponse } from 'next/server';
import {
  cacheSetCounter,
  cacheDeleteCounter,
  cacheStaleServeCounter,
  dbFallbackCounter,
} from '@/lib/redis/metrics';
import {
  requestCounter,
  dbQueryCounter,
  errorCounter,
  cacheHitCounter,
  cacheMissCounter,
} from '@/lib/observability';
import { getProvider } from '@/lib/redis/client';
import { isCircuitClosed } from '@/lib/redis/circuit-breaker';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get('format') || 'json';

  // Gather system metrics
  const metrics = {
    cache_set_total: cacheSetCounter.get(),
    cache_delete_total: cacheDeleteCounter.get(),
    cache_stale_serve_total: cacheStaleServeCounter.get(),
    cache_db_fallback_total: dbFallbackCounter.get(),
    http_requests_total: requestCounter.get(),
    db_queries_total: dbQueryCounter.get(),
    errors_total: errorCounter.get(),
    cache_hits_total: cacheHitCounter.get(),
    cache_misses_total: cacheMissCounter.get(),
  };

  // Determine Redis health
  let isRedisHealthy = false;
  if (isCircuitClosed()) {
    isRedisHealthy = await getProvider().ping();
  }

  if (format === 'prometheus') {
    const lines = [
      '# HELP cache_set_total Total cache write operations',
      '# TYPE cache_set_total counter',
      `cache_set_total ${metrics.cache_set_total}`,
      '# HELP cache_delete_total Total cache invalidation operations',
      '# TYPE cache_delete_total counter',
      `cache_delete_total ${metrics.cache_delete_total}`,
      '# HELP cache_stale_serve_total Total stale-while-revalidate serves',
      '# TYPE cache_stale_serve_total counter',
      `cache_stale_serve_total ${metrics.cache_stale_serve_total}`,
      '# HELP cache_db_fallback_total Total times Redis was bypassed',
      '# TYPE cache_db_fallback_total counter',
      `cache_db_fallback_total ${metrics.cache_db_fallback_total}`,
      '# HELP cache_hits_total Total successful cache retrievals',
      '# TYPE cache_hits_total counter',
      `cache_hits_total ${metrics.cache_hits_total}`,
      '# HELP cache_misses_total Total cache misses',
      '# TYPE cache_misses_total counter',
      `cache_misses_total ${metrics.cache_misses_total}`,
      '# HELP redis_healthy 1 if Redis is connected and circuit is closed',
      '# TYPE redis_healthy gauge',
      `redis_healthy ${isRedisHealthy ? 1 : 0}`,
    ];

    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    });
  }

  // Default JSON format
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    redis: {
      status: isCircuitClosed() ? 'CONNECTED' : 'CIRCUIT_OPEN',
      healthy: isRedisHealthy,
    },
    metrics,
  });
}
