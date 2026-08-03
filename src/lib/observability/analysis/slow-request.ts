import { TraceRecord } from '../types/observability.types';
import { ObservabilityConfig } from '@/lib/config/observability.config';

/**
 * Analyzes a completed trace for execution latency and classifies performance warnings or critical bottlenecks.
 */
export function analyzeSlowRequests(trace: TraceRecord): void {
  const totalDuration = trace.durationMs ?? 0;

  if (totalDuration >= ObservabilityConfig.criticalRequestThresholdMs) {
    const warning = `🚨 Critical Bottleneck: Total request execution time (${totalDuration}ms) exceeded critical threshold (${ObservabilityConfig.criticalRequestThresholdMs}ms)`;
    if (!trace.warnings.includes(warning)) {
      trace.warnings.push(warning);
    }
  } else if (totalDuration >= ObservabilityConfig.slowRequestThresholdMs) {
    const warning = `⚠ Slow Request: Total execution time (${totalDuration}ms) exceeded slow threshold (${ObservabilityConfig.slowRequestThresholdMs}ms)`;
    if (!trace.warnings.includes(warning)) {
      trace.warnings.push(warning);
    }
  }
}
