/* eslint-disable @typescript-eslint/no-explicit-any */
import { runBenchmark, assertMetric } from './runner';
import { fetchWithCache } from '../src/lib/redis/cache';
import { _setProviderForTesting } from '../src/lib/redis/client';
import { MemoryProvider } from '../src/lib/redis/providers/memory-provider';

async function runMemoryProviderBenchmark() {
  await runBenchmark(
    'Memory Provider (Local Engine Validation)',
    async () => {
      const memoryProvider = new MemoryProvider();
      _setProviderForTesting(memoryProvider);

      const TEST_KEY = 'benchmark:memory:1';

      let fetcherCalls = 0;
      const fetcher = async () => {
        fetcherCalls++;
        return { data: 'memory-test' };
      };

      // 1. Initial Fetch (MISS)
      const res1 = await fetchWithCache(
        { key: TEST_KEY, policy: 'search', tags: [] },
        fetcher
      );

      // 2. Second Fetch (HIT)
      const res2 = await fetchWithCache(
        { key: TEST_KEY, policy: 'search', tags: [] },
        fetcher
      );

      // 3. TTL Expiry Test (Use a very short TTL)
      const TTL_KEY = 'benchmark:memory:ttl';
      let ttlFetcherCalls = 0;
      await fetchWithCache(
        { key: TTL_KEY, policy: 'search', tags: [] },
        async () => {
          ttlFetcherCalls++;
          return { ok: true };
        }
      );

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 1100));

      await fetchWithCache(
        { key: TTL_KEY, policy: 'search', tags: [] },
        async () => {
          ttlFetcherCalls++;
          return { ok: true };
        }
      );

      return {
        metrics: {
          firstFetchData: (res1 as any)?.data ?? 'undefined',
          secondFetchData: (res2 as any)?.data ?? 'undefined',
          fetcherCalls, // Should be 1
          ttlFetcherCalls, // Should be 2
        },
      };
    },
    (result) => {
      assertMetric(
        result.metrics,
        'firstFetchData',
        (val) => val === 'memory-test',
        'First fetch should return correct data'
      );
      assertMetric(
        result.metrics,
        'secondFetchData',
        (val) => val === 'memory-test',
        'Second fetch should return correct data'
      );
      assertMetric(
        result.metrics,
        'fetcherCalls',
        (val) => val === 1,
        'Second fetch should have hit the cache, not the DB'
      );
      assertMetric(
        result.metrics,
        'ttlFetcherCalls',
        (val) => val === 2,
        'TTL expiry should trigger a second fetch'
      );
    }
  );
}

if (require.main === module) {
  runMemoryProviderBenchmark()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
