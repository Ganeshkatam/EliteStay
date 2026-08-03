import { StructuredLogEvent } from '../types/observability.types';
import { ObservabilityConfig } from '@/lib/config/observability.config';

/**
 * Formats structured log events into either clean human-readable CLI tags for development
 * or compact JSON strings for production logs and centralized aggregation.
 */
export function formatLogEvent(event: StructuredLogEvent): string {
  if (ObservabilityConfig.environment === 'production') {
    return JSON.stringify(event);
  }

  const shortTrace = event.traceId
    ? ` [Trace: ${event.traceId.split('-')[0]}]`
    : '';
  const shortSpan = event.spanId ? ` [Span: ${event.spanId}]` : '';
  const duration =
    event.durationMs !== undefined ? ` (${event.durationMs}ms)` : '';
  const mem =
    event.memoryDeltaMB !== undefined && event.memoryDeltaMB !== 0
      ? ` [RAM: ${event.memoryDeltaMB >= 0 ? '+' : ''}${event.memoryDeltaMB}MB]`
      : '';
  const dataString =
    event.data && Object.keys(event.data).length > 0
      ? ` ${JSON.stringify(event.data)}`
      : '';

  return `${event.timestamp} [${event.level.toUpperCase()}] [${event.category}]${shortTrace}${shortSpan}: ${event.message}${duration}${mem}${dataString}`;
}
