import { TraceRepository, TraceQueryFilters } from './trace.repository';
import { TraceRecord } from '../types/observability.types';
import { ObservabilityConfig } from '@/lib/config/observability.config';

/**
 * In-memory ring buffer implementation of TraceRepository.
 * Stores up to configurable maximum recent traces (default 2,000) with zero database load.
 */
export class MemoryTraceRepository implements TraceRepository {
  private buffer: TraceRecord[] = [];
  private indexMap: Map<string, TraceRecord> = new Map();

  public save(trace: TraceRecord): void {
    if (this.buffer.length >= ObservabilityConfig.ringBufferSize) {
      // Remove oldest trace to preserve ring buffer cap
      const evicted = this.buffer.shift();
      if (evicted) {
        this.indexMap.delete(evicted.traceId);
      }
    }

    this.buffer.push(trace);
    this.indexMap.set(trace.traceId, trace);
  }

  public getById(traceId: string): TraceRecord | null {
    return this.indexMap.get(traceId) ?? null;
  }

  public query(filters: TraceQueryFilters = {}): TraceRecord[] {
    let results = [...this.buffer].reverse(); // Most recent first

    if (filters.traceId) {
      results = results.filter((t) => t.traceId === filters.traceId);
    }
    if (filters.minDurationMs !== undefined && filters.minDurationMs !== null) {
      const minMs = filters.minDurationMs;
      results = results.filter((t) => (t.durationMs ?? 0) >= minMs);
    }
    if (filters.hasErrors === true) {
      results = results.filter((t) => t.errors.length > 0);
    }
    if (filters.hasWarnings === true) {
      results = results.filter((t) => t.warnings.length > 0);
    }
    if (filters.limit && filters.limit > 0) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  public clear(): void {
    this.buffer = [];
    this.indexMap.clear();
  }
}

export const memoryTraceRepository = new MemoryTraceRepository();
