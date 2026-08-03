import { createHash } from 'crypto';
import { TraceRecord } from '../types/observability.types';
import { ObservabilityConfig } from '@/lib/config/observability.config';

/**
 * Inspects a trace for identical repeated SQL queries executed within the same request lifecycle
 * using SHA-256 query hashes for accurate matching.
 */
export function analyzeDuplicateQueries(trace: TraceRecord): void {
  const queryCounts = new Map<string, { count: number; sql: string }>();

  for (const span of trace.allSpans) {
    if (span.category === 'DATABASE' && typeof span.metadata.sql === 'string') {
      const rawSql = span.metadata.sql.trim().toLowerCase();
      // Basic normalization of parameter values (removes exact numbers or string literals)
      const normalizedSql = rawSql
        .replace(/'[^']*'/g, "'?'")
        .replace(/\b\d+\b/g, '?');

      const queryHash = createHash('sha256')
        .update(normalizedSql)
        .digest('hex')
        .substring(0, 16);

      // Stamp the hash on the span for Trace Explorer visualization
      span.metadata.queryHash = queryHash;

      const current = queryCounts.get(queryHash);
      if (current) {
        current.count++;
      } else {
        queryCounts.set(queryHash, { count: 1, sql: rawSql });
      }
    }
  }

  for (const { count, sql } of queryCounts.values()) {
    if (count >= ObservabilityConfig.duplicateQueryThreshold) {
      const displaySql = sql.length > 60 ? `${sql.slice(0, 57)}...` : sql;
      const warning = `Repeated Query: Similar SQL ("${displaySql}") was executed ${count} times`;
      if (!trace.warnings.includes(warning)) {
        trace.warnings.push(warning);
      }
    }
  }
}
