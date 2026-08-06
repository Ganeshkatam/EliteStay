# Benchmark Summary

## Brotli Compression Efficiency

**Status:** ✅ PASS (176.73 ms)

| Metric           | Value  |
| ---------------- | ------ |
| rawSizeBytes     | 514781 |
| encodedSizeBytes | 3062   |
| compressionRatio | 168.12 |
| encodeDurationMs | 168.46 |
| decodeDurationMs | 3.68   |
| dataPreserved    | 1      |

---

## Circuit Breaker Transitions

**Status:** ✅ PASS (44019.10 ms)

| Metric                     | Value |
| -------------------------- | ----- |
| circuitClosedAfterFailures | 0     |
| circuitClosedAfterRecovery | 1     |
| fetcherCalls               | 6     |

---

## Memory Provider (Local Engine Validation)

**Status:** ✅ PASS (1119.77 ms)

| Metric          | Value       |
| --------------- | ----------- |
| firstFetchData  | memory-test |
| secondFetchData | memory-test |
| fetcherCalls    | 1           |
| ttlFetcherCalls | 2           |

---

## Negative Caching Effectiveness

**Status:** ✅ PASS (243.66 ms)

| Metric           | Value |
| ---------------- | ----- |
| concurrency      | 100   |
| nullResponses    | 100   |
| fetcherCalls     | 1     |
| secondFetchCount | 0     |

---

## Stale-While-Revalidate (SWR)

**Status:** ✅ PASS (4603.25 ms)

| Metric              | Value     |
| ------------------- | --------- |
| concurrency         | 100       |
| staleResponses      | 100       |
| freshResponses      | 0         |
| backgroundRefreshes | 1         |
| finalVersion        | version-2 |

---

## Stampede Protection (Cold Cache)

**Status:** ✅ PASS (319.75 ms)

| Metric          | Value  |
| --------------- | ------ |
| concurrency     | 500    |
| totalDurationMs | 252.02 |
| fetcherCalls    | 1      |
| p50Ms           | 249.2  |
| p95Ms           | 249.78 |
| p99Ms           | 250    |

---

## Stampede Protection (TTL Expiry)

**Status:** ✅ PASS (1574.66 ms)

| Metric       | Value  |
| ------------ | ------ |
| concurrency  | 500    |
| fetcherCalls | 1      |
| p95Ms        | 229.04 |

---
