/**
 * Redis Health Check.
 *
 * Wraps the provider's `ping()` behind the circuit breaker.
 * Falls back gracefully -- Redis is never a single point of failure.
 */

import { getProvider, getProviderType } from './client';
import {
  isCircuitClosed,
  recordSuccess,
  recordFailure,
} from './circuit-breaker';

export interface CacheHealth {
  status: 'healthy' | 'degraded' | 'offline';
  provider: 'upstash' | 'memory' | 'ioredis';
  latencyMs: number;
  circuitBreaker: {
    status: 'closed' | 'open' | 'half-open';
    failures: number;
  };
}

export interface RedisHealthStatus {
  healthy: boolean;
  providerType: 'upstash' | 'memory' | 'ioredis';
  circuitClosed: boolean;
}

/**
 * Check whether Redis is reachable and the circuit is closed.
 */
export async function isHealthy(): Promise<RedisHealthStatus> {
  const providerType = getProviderType();
  const circuitClosed = isCircuitClosed();

  if (!circuitClosed) {
    return { healthy: false, providerType, circuitClosed: false };
  }

  try {
    const provider = getProvider();
    const pong = await provider.ping();

    if (pong) {
      recordSuccess();
      return { healthy: true, providerType, circuitClosed: true };
    }

    recordFailure();
    return { healthy: false, providerType, circuitClosed: true };
  } catch {
    recordFailure();
    return { healthy: false, providerType, circuitClosed: true };
  }
}
