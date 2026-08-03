/**
 * Unified Public API for the EliteStay Observability Platform.
 * First-class infrastructure layer governing distributed tracing, metrics, category logging, and automated instrumentation.
 */

export * from './types/observability.types';
export * from '@/lib/config/observability.config';
export * from './context/request-context';
export * from './tracing/trace';
export * from './tracing/correlation-id';
export * from './spans/span';
export * from './logging/logger';
export * from './logging/formatters';
export * from './metrics/counters';
export * from './metrics/histograms';
export * from './metrics/gauges';
export * from './instrumentation/instrumentation';
export * from './instrumentation/sql-observer';
export * from './decorators/observe-service';
export * from './decorators/observe-repository';
export * from './summary/request-summary.builder';
export * from './repository/trace.repository';
export * from './repository/memory.repository';
export * from './exporters/exporter.interface';
export * from './exporters/console.exporter';
export * from './exporters/json.exporter';
export * from './exporters/otel.exporter';
export * from './analysis/slow-request';
export * from './analysis/duplicate-query';
export * from './analysis/n-plus-one';
export * from './events/business-events';
export * from './errors/exception-fingerprint';
export * from './instrumentation/cache-observer';
export * from './instrumentation/react-observer';
export * from './instrumentation/background-observer';
export * from './utils/resource-snapshot';
