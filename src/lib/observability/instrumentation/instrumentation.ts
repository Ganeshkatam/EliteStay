import { LogCategory, SpanMetadata } from '../types/observability.types';
import { RequestContext } from '../context/request-context';
import { Trace } from '../tracing/trace';
import { Span } from '../spans/span';
import { requestCounter, errorCounter } from '../metrics/counters';
import { activeRequestsGauge } from '../metrics/gauges';
import { requestLatencyHistogram } from '../metrics/histograms';
import { logger } from '../logging/logger';
import { exceptionFingerprints } from '../errors/exception-fingerprint';

/**
 * Universal execution middleware that instruments HTTP requests, Server Actions, cron jobs, CLI tools, and migrations.
 * Manages root Trace boundaries and automatically nests Spans when called within an active trace lifecycle.
 */
export async function instrumentExecution<T>(
  name: string,
  category: LogCategory,
  fn: () => Promise<T> | T,
  metadata: SpanMetadata = {}
): Promise<T> {
  const existingTrace = RequestContext.getActiveTrace();

  // 1. Root Trace Startup (No active parent trace found in AsyncLocalStorage)
  if (!existingTrace) {
    const trace = new Trace(name, metadata);
    activeRequestsGauge.inc();
    requestCounter.inc();

    return RequestContext.runWithTrace(trace, async () => {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        errorCounter.inc();
        trace.rootSpan.recordException(error);
        exceptionFingerprints.record(
          error,
          name,
          metadata.service as string | undefined
        );
        logger
          .category('ERROR')
          .error(`Unhandled exception in root trace [${name}]`, {
            error: String(error),
          });
        throw error;
      } finally {
        const record = await trace.finish();
        activeRequestsGauge.dec();
        if (record.durationMs !== undefined) {
          requestLatencyHistogram.observe(record.durationMs);
        }
      }
    }) as Promise<T>;
  }

  // 2. Nested Child Span Startup (Executing inside an existing trace hierarchy)
  const parentSpan = RequestContext.getActiveSpan();
  const childSpan = new Span(
    name,
    category,
    existingTrace.traceId,
    parentSpan?.spanId ?? null,
    metadata
  );

  return RequestContext.runWithSpan(childSpan, async () => {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      childSpan.recordException(error);
      exceptionFingerprints.record(
        error,
        existingTrace.name,
        metadata.service as string | undefined
      );
      throw error;
    } finally {
      const node = childSpan.finish();
      existingTrace.registerSpanNode(node, parentSpan?.spanId ?? null);
      if (category === 'SERVICE' || category === 'DATABASE') {
        logger
          .category(category)
          .info(
            `Completed ${name}`,
            metadata,
            node.snapshot.durationMs,
            node.snapshot.memoryDeltaMB
          );
      }
    }
  }) as Promise<T>;
}
