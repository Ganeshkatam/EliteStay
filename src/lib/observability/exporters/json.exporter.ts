import { TelemetryExporter, TraceRecord } from '../types/observability.types';
import { ObservabilityConfig } from '@/lib/config/observability.config';

/**
 * Exports structured production JSON logs of trace lifecycles, optimized for ingestion by Loki, BetterStack, or Datadog.
 */
export class JsonExporter implements TelemetryExporter {
  public export(trace: TraceRecord): void {
    if (
      !ObservabilityConfig.exporters.json &&
      ObservabilityConfig.environment !== 'production'
    ) {
      return;
    }
    if (ObservabilityConfig.environment === 'testing') {
      return;
    }

    const payload = {
      event: 'trace_completed',
      traceId: trace.traceId,
      name: trace.name,
      durationMs: trace.durationMs,
      startTime: new Date(trace.startTime).toISOString(),
      endTime: trace.endTime
        ? new Date(trace.endTime).toISOString()
        : undefined,
      warnings: trace.warnings,
      errors: trace.errors,
      spanCount: trace.allSpans.length,
      memoryDeltaMB: trace.rootSpan.snapshot.memoryDeltaMB,
      metadata: trace.metadata,
      environment: ObservabilityConfig.environment,
    };

    // Output clean JSON stream without human formatting in production
    console.info(JSON.stringify(payload));
  }
}

export const jsonExporter = new JsonExporter();
