import { runBenchmark, assertMetric } from './runner';
import { fetchWithCache } from '../src/lib/redis/cache';
import { getProvider } from '../src/lib/redis/client';

async function runNegativeCacheBenchmark() {
  await runBenchmark(
    'Negative Caching Effectiveness',
    async () => {
      const provider = getProvider();
      const TEST_KEY = 'benchmark:negative:1';

      await provider.del(TEST_KEY);

      let fetcherCalls = 0;
      const fetcher = async () => {
        fetcherCalls++;
        await new Promise((resolve) => setTimeout(resolve, 150)); // Sim DB latency
        return null; // DB returns nothing (e.g. 404 Property Not Found)
      };

      const concurrency = 100;

      // Fire 100 concurrent requests for the missing data
      const promises = Array.from({ length: concurrency }).map(() => {
        return fetchWithCache({
          key: TEST_KEY,
          ttl: 60,
          negativeTtl: 30, // Important: enabling negative cache
          fetcher,
        });
      });

      const results = await Promise.all(promises);
      const nullResponses = results.filter((r) => r === null);

      // Wait a moment, then fire one more request to prove it's still cached as null
      let secondFetchCount = 0;
      await fetchWithCache({
        key: TEST_KEY,
        ttl: 60,
        negativeTtl: 30,
        fetcher: async () => {
          secondFetchCount++;
          return null;
        },
      });

      return {
        metrics: {
          concurrency,
          nullResponses: nullResponses.length,
          fetcherCalls, // Should be 1 due to coalescing/locking
          secondFetchCount, // Should be 0, as it hits negative cache
        },
      };
    },
    (result) => {
      assertMetric(
        result.metrics,
        'nullResponses',
        (val) => val === 100,
        'All requests should return null'
      );
      assertMetric(
        result.metrics,
        'fetcherCalls',
        (val) => val === 1,
        'Only 1 DB query should be executed (stampede protection)'
      );
      assertMetric(
        result.metrics,
        'secondFetchCount',
        (val) => val === 0,
        'Subsequent fetch should hit negative cache, 0 DB queries'
      );
    }
  );
}

if (require.main === module) {
  runNegativeCacheBenchmark()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
