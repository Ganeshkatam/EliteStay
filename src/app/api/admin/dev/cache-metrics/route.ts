import { NextResponse } from 'next/server';
import { isHealthy } from '@/lib/redis/health';
import {
  cacheSetCounter,
  dbFallbackCounter,
  cacheStaleServeCounter,
} from '@/lib/redis/metrics';
import { getProviderType } from '@/lib/redis/client';
import {
  CIRCUIT_FAILURE_THRESHOLD,
  CIRCUIT_COOLDOWN_MS,
} from '@/lib/redis/config';

export async function GET() {
  const health = await isHealthy();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    provider: getProviderType(),
    health,
    config: {
      circuitBreaker: {
        failureThreshold: CIRCUIT_FAILURE_THRESHOLD,
        cooldownMs: CIRCUIT_COOLDOWN_MS,
      },
    },
    metrics: {
      writes: cacheSetCounter.get(),
      staleServes: cacheStaleServeCounter.get(),
      dbFallbacks: dbFallbackCounter.get(),
    },
  });
}
