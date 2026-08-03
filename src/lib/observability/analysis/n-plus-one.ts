import { TraceRecord } from '../types/observability.types';
import { ObservabilityConfig } from '@/lib/config/observability.config';

/**
 * Analyzes repository and database execution frequencies inside a single trace to diagnose potential N+1 query loops.
 */
export function analyzeNPlusOne(trace: TraceRecord): void {
  const invocationCounts = new Map<string, number>();

  for (const span of trace.allSpans) {
    if (
      span.category === 'DATABASE' ||
      typeof span.metadata.repository === 'string'
    ) {
      // Group by repository method (e.g., HostRepository.getListingById) or generic SQL table operation
      const key =
        typeof span.metadata.repository === 'string'
          ? `${span.metadata.repository}.${span.name}`
          : span.name;

      const count = (invocationCounts.get(key) || 0) + 1;
      invocationCounts.set(key, count);
    }
  }

  for (const [operation, count] of invocationCounts.entries()) {
    if (count >= ObservabilityConfig.nPlusOneThreshold) {
      const warning = `Potential N+1 Query: "${operation}" was invoked ${count} times within a single request lifecycle`;
      if (!trace.warnings.includes(warning)) {
        trace.warnings.push(warning);
      }
    }
  }
}
