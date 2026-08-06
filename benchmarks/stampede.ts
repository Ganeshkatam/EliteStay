/* eslint-disable */
import { runBenchmark, assertMetric, calculatePercentile } from './runner';
import { fetchWithCache } from '../src/lib/redis/cache';
import { getProvider } from '../src/lib/redis/client';

async function runStampedeBenchmark() {
  await runBenchmark(
    'Stampede Protection (Cold Cache)',
    async () => {
      const provider = getProvider();
      const TEST_KEY = 'benchmark:stampede:1';

      // Setup
      await provider.del(TEST_KEY);

      let fetcherCalls = 0;
      const fetcher = async () => {
        fetcherCalls++;
        // Simulate DB latency
        await new Promise((resolve) => setTimeout(resolve, 200));
        return { data: 'hello world' };
      };

      const concurrency = 500;
      const start = performance.now();

      // Fire 500 concurrent requests
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
      const totalDuration = performance.now() - start;
      const latencies = results.map((r) => r.latency);

      // Verify data correctness
      const invalidResponses = results.filter(
        (r) => (r.data as any)?.data !== 'hello world'
      );
      if (invalidResponses.length > 0) {
        throw new Error(
          `Data corruption detected in ${invalidResponses.length} responses`
        );
      }

      const p50 = calculatePercentile(latencies, 50);
      const p95 = calculatePercentile(latencies, 95);
      const p99 = calculatePercentile(latencies, 99);

      return {
        metrics: {
          concurrency,
          totalDurationMs: parseFloat(totalDuration.toFixed(2)),
          fetcherCalls,
          p50Ms: parseFloat(p50.toFixed(2)),
          p95Ms: parseFloat(p95.toFixed(2)),
          p99Ms: parseFloat(p99.toFixed(2)),
        },
      };
    },
    (result) => {
      assertMetric(
        result.metrics,
        'fetcherCalls',
        (val) => val === 1,
        'Only 1 DB query should execute'
      );
      assertMetric(
        result.metrics,
        'p95Ms',
        (val) => val < 300,
        'P95 latency should be less than 300ms'
      );
    }
  );

  // Scenario 2: TTL Expiry Stampede
  await runBenchmark(
    'Stampede Protection (TTL Expiry)',
    async () => {
      const provider = getProvider();
      const TEST_KEY = 'benchmark:stampede:expiry';

      let fetcherCalls = 0;
      const fetcher = async () => {
        fetcherCalls++;
        await new Promise((resolve) => setTimeout(resolve, 200));
        return { data: 'fresh data' };
      };

      // Populate Cache with 1 second TTL
      await fetchWithCache(
        { key: TEST_KEY, policy: 'search', tags: [] },
        fetcher
      );

      // Wait 1.1s for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      fetcherCalls = 0; // reset for the stampede
      const concurrency = 500;

      // Fire 500 concurrent requests immediately after expiry
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
      const latencies = results.map((r) => r.latency);

      return {
        metrics: {
          concurrency,
          fetcherCalls,
          p95Ms: parseFloat(calculatePercentile(latencies, 95).toFixed(2)),
        },
      };
    },
    (result) => {
      assertMetric(
        result.metrics,
        'fetcherCalls',
        (val) => val === 1,
        'Only 1 DB query should execute after expiry'
      );
    }
  );
}

if (require.main === module) {
  runStampedeBenchmark()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
