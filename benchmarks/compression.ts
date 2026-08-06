import { runBenchmark, assertMetric } from './runner';
import { encode, decode } from '../src/lib/redis/serializer';

async function runCompressionBenchmark() {
  await runBenchmark(
    'Brotli Compression Efficiency',
    async () => {
      // Generate a large JSON payload (~100KB)
      const largePayload = Array.from({ length: 1000 }).map((_, i) => ({
        id: i,
        title: `Property ${i}`,
        description:
          'A beautiful property with amazing views, perfect for a family vacation. '.repeat(
            5
          ),
        price: 150 + (i % 100),
        amenities: ['wifi', 'pool', 'kitchen', 'parking', 'ac'],
        location: { lat: 34.05, lng: -118.25 },
      }));

      const rawJson = JSON.stringify(largePayload);
      const rawSizeBytes = Buffer.byteLength(rawJson);

      const encodeStart = performance.now();
      const encodedString = encode(largePayload, 3600); // Should trigger compression
      const encodeDurationMs = performance.now() - encodeStart;

      const encodedSizeBytes = Buffer.byteLength(encodedString);

      const decodeStart = performance.now();
      const decodedEnvelope = decode<typeof largePayload>(encodedString);
      const decodeDurationMs = performance.now() - decodeStart;

      const compressionRatio = rawSizeBytes / encodedSizeBytes;

      return {
        metrics: {
          rawSizeBytes,
          encodedSizeBytes,
          compressionRatio: parseFloat(compressionRatio.toFixed(2)),
          encodeDurationMs: parseFloat(encodeDurationMs.toFixed(2)),
          decodeDurationMs: parseFloat(decodeDurationMs.toFixed(2)),
          dataPreserved:
            decodedEnvelope.payload?.length === largePayload.length ? 1 : 0,
        },
      };
    },
    (result) => {
      assertMetric(
        result.metrics,
        'dataPreserved',
        (val) => val === 1,
        'Decoded payload should match original'
      );
      assertMetric(
        result.metrics,
        'compressionRatio',
        (val) => val > 3,
        'Compression ratio should be > 3x for this repetitive data'
      );
      assertMetric(
        result.metrics,
        'encodeDurationMs',
        (val) => val < 300,
        'Compression should take less than 300ms'
      );
      assertMetric(
        result.metrics,
        'decodeDurationMs',
        (val) => val < 300,
        'Decompression should take less than 300ms'
      );
    }
  );
}

if (require.main === module) {
  runCompressionBenchmark()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
