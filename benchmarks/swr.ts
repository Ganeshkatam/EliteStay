/* eslint-disable */
import { runBenchmark, assertMetric } from './runner';
import { fetchWithCache } from '../src/lib/redis/cache';
import { getProvider } from '../src/lib/redis/client';
import { STALE_WINDOW_FRACTION } from '../src/lib/redis/config';

async function runSwrBenchmark() {
  await runBenchmark(
    'Stale-While-Revalidate (SWR)',
    async () => {
      const provider = getProvider();
      const TEST_KEY = 'benchmark:swr:1';

      await provider.del(TEST_KEY);

      let fetcherCalls = 0;
      const fetcher = async () => {
        fetcherCalls++;
        await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms DB latency
        return { data: `version-${fetcherCalls}` };
      };

      // 1. Initial population (TTL: 5 seconds)
      const ttl = 5;
      await fetchWithCache(
        { key: TEST_KEY, policy: 'search', tags: [] },
        fetcher
      );

      // 2. Advance into the stale window.
      // freshThreshold = 5 * 0.8 = 4s.
      // Wait 4100ms to ensure age is 4. (4 >= 4 && 4 < 5)
      await new Promise((resolve) => setTimeout(resolve, 4100));

      const concurrency = 100;
      const initialFetcherCalls = fetcherCalls; // Should be 1

      // 3. Fire 100 concurrent requests during the stale window
      const promises = Array.from({ length: concurrency }).map(async () => {
        const reqStart = performance.now();
        const res = await fetchWithCache(
          { key: TEST_KEY, policy: 'search', tags: [] },
          fetcher
        );
        return {
          latency: performance.now() - reqStart,
          data: res,
        };
      });

      const results = await Promise.all(promises);
      const staleResponses = results.filter(
        (r) => (r.data as any)?.data === 'version-1'
      );
      const freshResponses = results.filter(
        (r) => (r.data as any)?.data === 'version-2'
      );

      // 4. Wait for background refresh to finish (should take ~100ms)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 5. Verify the cache was updated by the background refresh
      const finalRes = await fetchWithCache(
        { key: TEST_KEY, policy: 'search', tags: [] },
        fetcher
      );

      return {
        metrics: {
          concurrency,
          staleResponses: staleResponses.length,
          freshResponses: freshResponses.length,
          backgroundRefreshes: fetcherCalls - initialFetcherCalls,
          finalVersion: (finalRes as any)?.data ?? 'undefined',
        },
      };
    },
    (result) => {
      assertMetric(
        result.metrics,
        'staleResponses',
        (val) => val === 100,
        'All 100 requests should get stale data instantly'
      );
      assertMetric(
        result.metrics,
        'backgroundRefreshes',
        (val) => val === 1,
        'Exactly 1 background refresh should execute'
      );
      assertMetric(
        result.metrics,
        'finalVersion',
        (val) => val === 'version-2',
        'Background refresh should update the cache to version-2'
      );
    }
  );
}

if (require.main === module) {
  runSwrBenchmark()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
