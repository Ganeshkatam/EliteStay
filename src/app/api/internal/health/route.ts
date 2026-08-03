import { NextResponse } from 'next/server';
import {
  activeRequestsGauge,
  memoryGauge,
  requestLatencyHistogram,
  requestCounter,
  cacheHitCounter,
  cacheMissCounter,
  errorCounter,
  getMemoryConsumptionMB,
} from '@/lib/observability';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hits = cacheHitCounter.get();
  const misses = cacheMissCounter.get();
  const totalCache = hits + misses;
  const cacheHitRate = totalCache > 0 ? (hits / totalCache).toFixed(2) : '0.00';

  const latencyStats = requestLatencyHistogram.getStats();

  const currentMemory = getMemoryConsumptionMB();
  memoryGauge.set(currentMemory);

  const healthPayload = {
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    memoryMB: currentMemory,
    activeRequests: activeRequestsGauge.get(),
    totalRequests: requestCounter.get(),
    averageLatencyMs: latencyStats.avg,
    p95LatencyMs: latencyStats.p95,
    totalErrors: errorCounter.get(),
    cacheHitRate: parseFloat(cacheHitRate),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(healthPayload, { status: 200 });
}
