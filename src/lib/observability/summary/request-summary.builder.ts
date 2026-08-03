import { TraceRecord, SpanNode } from '../types/observability.types';

export interface RequestSummaryStats {
  traceId: string;
  name: string;
  totalDurationMs: number;
  dbDurationMs: number;
  serviceDurationMs: number;
  repoDurationMs: number;
  memoryDeltaMB: number;
  queryCount: number;
  cacheStatus: 'HIT' | 'MISS' | 'WRITE' | 'N/A';
  warningCount: number;
  errorCount: number;
  formattedBox: string;
  executionTree: string;
}

/**
 * Transforms a completed TraceRecord span tree into aggregated timing breakdowns and visual ASCII reports.
 */
export class RequestSummaryBuilder {
  public static build(trace: TraceRecord): RequestSummaryStats {
    let dbDurationMs = 0;
    let serviceDurationMs = 0;
    let repoDurationMs = 0;
    let queryCount = 0;
    let cacheStatus: 'HIT' | 'MISS' | 'WRITE' | 'N/A' = 'N/A';

    for (const span of trace.allSpans) {
      const dur = span.snapshot.durationMs ?? 0;

      if (
        span.category === 'DATABASE' ||
        typeof span.metadata.sql === 'string'
      ) {
        dbDurationMs += dur;
        queryCount += 1;
      } else if (
        span.category === 'SERVICE' ||
        typeof span.metadata.service === 'string'
      ) {
        serviceDurationMs += dur;
      } else if (typeof span.metadata.repository === 'string') {
        repoDurationMs += dur;
      }

      if (span.metadata.cacheStatus && cacheStatus === 'N/A') {
        cacheStatus = span.metadata.cacheStatus as 'HIT' | 'MISS' | 'WRITE';
      }
    }

    const totalDurationMs = trace.durationMs ?? 0;
    const memoryDeltaMB = trace.rootSpan.snapshot.memoryDeltaMB ?? 0;
    const warningCount = trace.warnings.length;
    const errorCount = trace.errors.length;

    const shortTraceId = trace.traceId.split('-')[0] || trace.traceId;
    const memoryDisplay = `${memoryDeltaMB >= 0 ? '+' : ''}${memoryDeltaMB.toFixed(2)} MB`;

    // Construct ASCII box
    const lines = [
      `────────────────────────────────────────────────────────────`,
      `[${trace.name}]  Trace: ${shortTraceId}`,
      `Total: ${totalDurationMs}ms | DB: ${dbDurationMs}ms (${queryCount} queries) | Services: ${serviceDurationMs}ms | Repos: ${repoDurationMs}ms`,
      `Memory Delta: ${memoryDisplay} | Cache: ${cacheStatus} | Warnings: ${warningCount} | Errors: ${errorCount}`,
    ];

    if (warningCount > 0) {
      lines.push(`Alerts: ${trace.warnings.join(' ; ')}`);
    }

    lines.push(`────────────────────────────────────────────────────────────`);
    const formattedBox = lines.join('\n');

    // Build ASCII execution tree
    const treeLines: string[] = [`${trace.name} (${totalDurationMs}ms)`];
    this.appendSpanChildren(trace.rootSpan.children, '', treeLines);
    const executionTree = treeLines.join('\n');

    return {
      traceId: trace.traceId,
      name: trace.name,
      totalDurationMs,
      dbDurationMs,
      serviceDurationMs,
      repoDurationMs,
      memoryDeltaMB,
      queryCount,
      cacheStatus,
      warningCount,
      errorCount,
      formattedBox,
      executionTree,
    };
  }

  private static appendSpanChildren(
    children: SpanNode[],
    prefix: string,
    lines: string[]
  ): void {
    const len = children.length;
    for (let i = 0; i < len; i++) {
      const child = children[i];
      const isLast = i === len - 1;
      const connector = isLast ? '└── ' : '├── ';
      const dur =
        child.snapshot.durationMs !== undefined
          ? ` (${child.snapshot.durationMs}ms)`
          : '';
      const statusIcon =
        child.snapshot.status === 'ERROR'
          ? ' [ERROR]'
          : child.snapshot.status === 'WARNING'
            ? ' [WARN]'
            : '';

      lines.push(`${prefix}${connector}${child.name}${dur}${statusIcon}`);

      const nextPrefix = prefix + (isLast ? '    ' : '│   ');
      if (child.children && child.children.length > 0) {
        this.appendSpanChildren(child.children, nextPrefix, lines);
      }
    }
  }
}
