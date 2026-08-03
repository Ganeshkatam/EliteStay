/**
 * Core type interfaces for the EliteStay Observability Platform.
 * Enforces structured categories, hierarchical Spans, resource snapshots, and export contracts.
 */

export type LogCategory =
  | 'REQUEST'
  | 'DATABASE'
  | 'SERVICE'
  | 'ACTION'
  | 'CACHE'
  | 'AUTH'
  | 'SECURITY'
  | 'PERFORMANCE'
  | 'ERROR'
  | 'BUSINESS'
  | 'RENDER'
  | 'TASK';

export type ExecutionStatus = 'SUCCESS' | 'ERROR' | 'WARNING';

export interface ResourceSnapshot {
  startTimestamp: number;
  endTimestamp?: number;
  durationMs?: number;
  memoryBeforeMB: number;
  memoryAfterMB?: number;
  memoryDeltaMB?: number;
  cpuUserMs?: number;
  cpuSystemMs?: number;
  status: ExecutionStatus;
  warnings: string[];
  errorMessage?: string;
  errorStack?: string;
}

export interface SpanMetadata {
  route?: string;
  service?: string;
  repository?: string;
  action?: string;
  sql?: string;
  queryHash?: string;
  rows?: number;
  cacheStatus?: 'HIT' | 'MISS' | 'WRITE' | 'INVALIDATE' | 'EXPIRE';
  userId?: string;
  tags?: Record<string, string | number | boolean>;
  [key: string]: unknown;
}

export interface SpanNode {
  spanId: string;
  parentSpanId: string | null;
  traceId: string;
  name: string;
  category: LogCategory;
  snapshot: ResourceSnapshot;
  metadata: SpanMetadata;
  children: SpanNode[];
}

export interface TraceVersionMetadata {
  gitCommit: string;
  buildVersion: string;
  deployment: string;
  environment: string;
}

export interface TraceRecord {
  traceId: string;
  name: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  rootSpan: SpanNode;
  allSpans: SpanNode[];
  warnings: string[];
  errors: string[];
  metadata: Record<string, unknown>;
  tags: Record<string, string | number | boolean>;
  version: TraceVersionMetadata;
}

export interface TelemetryExporter {
  export(trace: TraceRecord): Promise<void> | void;
}

export interface StructuredLogEvent {
  timestamp: string;
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  category: LogCategory;
  message: string;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  durationMs?: number;
  memoryDeltaMB?: number;
  data?: Record<string, unknown>;
}
