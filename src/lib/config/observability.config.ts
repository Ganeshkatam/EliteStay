/**
 * Centralized Configuration Layer for the EliteStay Observability Platform.
 * Governs execution thresholds, environment modes, sampling behavior, and telemetry exporters.
 */

export type EnvironmentMode = 'development' | 'production' | 'testing';
export type SamplingPolicy =
  'all' | '10-percent' | '1-percent' | 'errors-only' | 'slow-only';

export interface ObservabilityConfiguration {
  environment: EnvironmentMode;
  slowRequestThresholdMs: number;
  criticalRequestThresholdMs: number;
  duplicateQueryThreshold: number;
  nPlusOneThreshold: number;
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  sampling: {
    policy: SamplingPolicy;
    rate: number; // 0.0 to 1.0
  };
  exporters: {
    console: boolean;
    json: boolean;
    otel: boolean;
  };
  ringBufferSize: number;
}

const env = (process.env.NODE_ENV as EnvironmentMode) || 'development';

export const ObservabilityConfig: ObservabilityConfiguration = {
  environment: env,
  slowRequestThresholdMs:
    Number(process.env.OBSERVABILITY_SLOW_THRESHOLD_MS) || 100,
  criticalRequestThresholdMs:
    Number(process.env.OBSERVABILITY_CRITICAL_THRESHOLD_MS) || 500,
  duplicateQueryThreshold:
    Number(process.env.OBSERVABILITY_DUPLICATE_QUERY_THRESHOLD) || 3,
  nPlusOneThreshold:
    Number(process.env.OBSERVABILITY_N_PLUS_ONE_THRESHOLD) || 3,
  logLevel:
    env === 'production' ? 'info' : env === 'testing' ? 'error' : 'debug',
  sampling: {
    policy: 'all',
    rate: 1.0,
  },
  exporters: {
    console: env !== 'testing',
    json: env === 'production',
    otel: Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT),
  },
  ringBufferSize: Number(process.env.OBSERVABILITY_RING_BUFFER_SIZE) || 2000,
};

/**
 * Determines whether a specific trace should be fully captured and exported based on sampling rules.
 */
export function shouldSampleTrace(
  isError: boolean,
  durationMs: number
): boolean {
  if (ObservabilityConfig.environment === 'testing') return false;
  const { policy, rate } = ObservabilityConfig.sampling;

  if (policy === 'errors-only') return isError;
  if (policy === 'slow-only')
    return durationMs >= ObservabilityConfig.slowRequestThresholdMs || isError;
  if (policy === '10-percent') return Math.random() <= 0.1 || isError;
  if (policy === '1-percent') return Math.random() <= 0.01 || isError;

  return Math.random() <= rate || isError;
}
