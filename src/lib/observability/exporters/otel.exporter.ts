import { TelemetryExporter, TraceRecord } from '../types/observability.types';
import { ObservabilityConfig } from '@/lib/config/observability.config';

/**
 * OpenTelemetry compatible exporter stub.
 * Transforms internal Span tree into standard OTLP JSON structures for Jaeger / Prometheus / Grafana ingestion.
 */
export class OTelExporter implements TelemetryExporter {
  public async export(trace: TraceRecord): Promise<void> {
    if (!ObservabilityConfig.exporters.otel) {
      return;
    }

    const otlpSpans = trace.allSpans.map((span) => ({
      trace_id: trace.traceId,
      span_id: span.spanId,
      parent_span_id: span.parentSpanId || undefined,
      name: span.name,
      start_time_unix_nano: (span.snapshot.startTimestamp * 1000000).toString(),
      end_time_unix_nano: (
        (span.snapshot.endTimestamp || Date.now()) * 1000000
      ).toString(),
      attributes: {
        'observability.category': span.category,
        'observability.status': span.snapshot.status,
        'observability.duration_ms': span.snapshot.durationMs,
        'observability.memory_delta_mb': span.snapshot.memoryDeltaMB,
        ...span.metadata,
      },
    }));

    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    if (endpoint) {
      try {
        await fetch(`${endpoint}/v1/traces`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource_spans: otlpSpans }),
        });
      } catch (e) {
        console.error(
          '[OTelExporter] Failed to transmit traces to OTLP collector:',
          e
        );
      }
    }
  }
}

export const otelExporter = new OTelExporter();
