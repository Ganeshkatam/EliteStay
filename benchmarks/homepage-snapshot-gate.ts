import { runBenchmark, assertMetric, calculatePercentile } from './runner';
import { encode, decode } from '../src/lib/redis/serializer';
import { getProvider } from '../src/lib/redis/client';
import { GuestHomeSnapshot } from '../src/features/guest/discovery/home/types/home-snapshot.types';
import { HomeService } from '../src/features/guest/discovery/home/services/HomeService';

async function runHomepageSnapshotGateBenchmark() {
  await runBenchmark(
    'Homepage Composite Snapshot - Real Production Gate Metrics',
    async () => {
      console.log(
        '[SnapshotGate] Fetching REAL homepage snapshot from live Supabase and HomeService...'
      );
      const snapshot = await HomeService.getHomeSnapshot();
      console.log(
        `[SnapshotGate] Successfully fetched real snapshot with ${snapshot.sections.length} sections, ${snapshot.categories.length} categories, ${snapshot.locations.length} locations.`
      );
      const rawJson = JSON.stringify(snapshot);
      const rawSizeBytes = Buffer.byteLength(rawJson, 'utf8');

      // 1. Measure Compression Ratio
      const encoded = encode(snapshot, 3600);
      const compressedSizeBytes = Buffer.byteLength(encoded, 'utf8');
      const compressionRatio = parseFloat(
        (rawSizeBytes / compressedSizeBytes).toFixed(2)
      );

      // 2. Measure Serialization Latencies (300 iterations)
      const ITERATIONS = 300;
      const serializeTimes: number[] = [];
      const deserializeTimes: number[] = [];

      for (let i = 0; i < ITERATIONS; i++) {
        const sStart = performance.now();
        const enc = encode(snapshot, 3600);
        serializeTimes.push(performance.now() - sStart);

        const dStart = performance.now();
        decode<GuestHomeSnapshot>(enc);
        deserializeTimes.push(performance.now() - dStart);
      }

      // 3. Measure Redis GET Latency & End-to-End Cache-Hit Latency
      const provider = getProvider();
      const SNAPSHOT_KEY = 'benchmark:snapshot:home:test';
      await provider.set(SNAPSHOT_KEY, encoded, 3600);

      const redisGetTimes: number[] = [];
      const e2eTimes: number[] = [];

      for (let i = 0; i < ITERATIONS; i++) {
        const e2eStart = performance.now();

        const getStart = performance.now();
        const payloadStr = await provider.get(SNAPSHOT_KEY);
        redisGetTimes.push(performance.now() - getStart);

        if (payloadStr) {
          decode<GuestHomeSnapshot>(payloadStr);
        }
        e2eTimes.push(performance.now() - e2eStart);
      }

      // Cleanup
      await provider.del(SNAPSHOT_KEY);

      return {
        metrics: {
          totalListingsInSnapshot: snapshot.sections.reduce(
            (acc, s) => acc + s.listings.length,
            0
          ),
          uncompressedBytes: rawSizeBytes,
          uncompressedKB: parseFloat((rawSizeBytes / 1024).toFixed(2)),
          compressedBytes: compressedSizeBytes,
          compressedKB: parseFloat((compressedSizeBytes / 1024).toFixed(2)),
          compressionRatio,
          // Serialization percentiles (ms)
          serialize_p50_ms: parseFloat(
            calculatePercentile(serializeTimes, 50).toFixed(3)
          ),
          serialize_p95_ms: parseFloat(
            calculatePercentile(serializeTimes, 95).toFixed(3)
          ),
          serialize_p99_ms: parseFloat(
            calculatePercentile(serializeTimes, 99).toFixed(3)
          ),
          // Deserialization percentiles (ms)
          deserialize_p50_ms: parseFloat(
            calculatePercentile(deserializeTimes, 50).toFixed(3)
          ),
          deserialize_p95_ms: parseFloat(
            calculatePercentile(deserializeTimes, 95).toFixed(3)
          ),
          deserialize_p99_ms: parseFloat(
            calculatePercentile(deserializeTimes, 99).toFixed(3)
          ),
          // Redis GET percentiles (ms)
          redis_get_p50_ms: parseFloat(
            calculatePercentile(redisGetTimes, 50).toFixed(3)
          ),
          redis_get_p95_ms: parseFloat(
            calculatePercentile(redisGetTimes, 95).toFixed(3)
          ),
          redis_get_p99_ms: parseFloat(
            calculatePercentile(redisGetTimes, 99).toFixed(3)
          ),
          // End-to-end hit percentiles (ms)
          e2e_hit_p50_ms: parseFloat(
            calculatePercentile(e2eTimes, 50).toFixed(3)
          ),
          e2e_hit_p95_ms: parseFloat(
            calculatePercentile(e2eTimes, 95).toFixed(3)
          ),
          e2e_hit_p99_ms: parseFloat(
            calculatePercentile(e2eTimes, 99).toFixed(3)
          ),
        },
      };
    },
    (result) => {
      assertMetric(
        result.metrics,
        'deserialize_p95_ms',
        (v) => Number(v) < 15,
        'p95 deserialization must be < 15ms'
      );
      assertMetric(
        result.metrics,
        'deserialize_p50_ms',
        (v) => Number(v) < 5,
        'p50 deserialization must be < 5ms'
      );
    }
  );
}

runHomepageSnapshotGateBenchmark()
  .then(() => {
    console.log('[SnapshotGate] Benchmark finished successfully. Exiting.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[SnapshotGate] Benchmark failed:', err);
    process.exit(1);
  });
