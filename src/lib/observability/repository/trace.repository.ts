import { TraceRecord } from '../types/observability.types';

export interface TraceQueryFilters {
  traceId?: string;
  minDurationMs?: number;
  hasErrors?: boolean;
  hasWarnings?: boolean;
  limit?: number;
}

/**
 * Abstract storage interface for recorded execution traces.
 * Ensures the core observability platform is decoupled from immediate persistence technology.
 */
export interface TraceRepository {
  save(trace: TraceRecord): Promise<void> | void;
  getById(traceId: string): Promise<TraceRecord | null> | TraceRecord | null;
  query(filters: TraceQueryFilters): Promise<TraceRecord[]> | TraceRecord[];
  clear(): Promise<void> | void;
}
