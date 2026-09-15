import { runBenchmark, assertMetric } from './runner';
import { fetchWithCache } from '../src/lib/redis/cache';
import { _setProviderForTesting, getProvider } from '../src/lib/redis/client';
import { CacheProvider } from '../src/lib/redis/providers/cache-provider';
import { isCircuitClosed } from '../src/lib/redis/circuit-breaker';
import {
  CIRCUIT_FAILURE_THRESHOLD,
  CIRCUIT_COOLDOWN_MS,
} from '../src/lib/redis/config';

class FailingProvider implements CacheProvider {
  async get(): Promise<string | null> {
    throw new Error('Injected Failure');
  }
  async set(): Promise<void> {
    throw new Error('Injected Failure');
  }
  async del(): Promise<void> {
    throw new Error('Injected Failure');
  }
  async exists(): Promise<boolean> {
    throw new Error('Injected Failure');
  }
  async setnx(): Promise<boolean> {
    throw new Error('Injected Failure');
  }
  async compareAndDelete(): Promise<boolean> {
    throw new Error('Injected Failure');
  }
  async ping(): Promise<boolean> {
    throw new Error('Injected Failure');
  }
  async incr(): Promise<number> {
    throw new Error('Injected Failure');
  }
  async ttl(key: string) {
    return -2;
  }
  async mget(keys: string[]) {
    return keys.map(() => null);
  }
  async mset(entries: Record<string, string>) {}
  async sadd(key: string, ...members: string[]) {
    return 0;
  }
  async smembers(key: string) {
    return [];
  }
  async srem(key: string, ...members: string[]) {
    return 0;
  }
}

async function runCircuitBreakerBenchmark() {
  await runBenchmark(
    'Circuit Breaker Transitions',
    async () => {
      const originalProvider = getProvider();
      const failingProvider = new FailingProvider();

      const TEST_KEY = 'benchmark:cb:1';

      let fetcherCalls = 0;
      const fetcher = async () => {
        fetcherCalls++;
        return { data: 'fallback' };
      };

      try {
        // Force failure
        _setProviderForTesting(failingProvider);

        // Trip the circuit by firing requests equal to failure threshold
        for (let i = 0; i < CIRCUIT_FAILURE_THRESHOLD; i++) {
          await fetchWithCache(
            { key: TEST_KEY, policy: 'search', tags: [] },
            fetcher
          );
        }

        const circuitClosedAfterFailures = isCircuitClosed(); // Should be false (OPEN)

        // Wait for cooldown period (plus a little buffer)
        await new Promise((resolve) =>
          setTimeout(resolve, CIRCUIT_COOLDOWN_MS + 100)
        );

        // Restore healthy provider
        _setProviderForTesting(originalProvider);

        // The first request after cooldown should be HALF-OPEN and succeed, closing the circuit
        await fetchWithCache(
          { key: TEST_KEY, policy: 'search', tags: [] },
          fetcher
        );

        const circuitClosedAfterRecovery = isCircuitClosed(); // Should be true (CLOSED)

        return {
          metrics: {
            circuitClosedAfterFailures: circuitClosedAfterFailures ? 1 : 0,
            circuitClosedAfterRecovery: circuitClosedAfterRecovery ? 1 : 0,
            fetcherCalls,
          },
        };
      } finally {
        // Ensure cleanup
        _setProviderForTesting(originalProvider);
      }
    },
    (result) => {
      assertMetric(
        result.metrics,
        'circuitClosedAfterFailures',
        (val) => val === 0,
        'Circuit should OPEN after threshold failures'
      );
      assertMetric(
        result.metrics,
        'circuitClosedAfterRecovery',
        (val) => val === 1,
        'Circuit should CLOSE after successful probe during half-open'
      );
    }
  );
}

if (require.main === module) {
  runCircuitBreakerBenchmark()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
