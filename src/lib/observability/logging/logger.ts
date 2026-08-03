import { LogCategory, StructuredLogEvent } from '../types/observability.types';
import { RequestContext } from '../context/request-context';
import { formatLogEvent } from './formatters';
import { ObservabilityConfig } from '@/lib/config/observability.config';

const LEVEL_WEIGHTS: Record<string, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

/**
 * Category-scoped structured logger that automatically attaches active Trace IDs and Span IDs
 * from AsyncLocalStorage without requiring manual parameter propagation.
 */
export class CategoryLogger {
  constructor(private readonly categoryName: LogCategory) {}

  private log(
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
    message: string,
    data?: Record<string, unknown>,
    durationMs?: number,
    memoryDeltaMB?: number
  ): void {
    if (
      ObservabilityConfig.environment === 'testing' &&
      level !== 'error' &&
      level !== 'fatal'
    ) {
      return;
    }

    const configWeight = LEVEL_WEIGHTS[ObservabilityConfig.logLevel] ?? 20;
    const msgWeight = LEVEL_WEIGHTS[level] ?? 30;
    if (msgWeight < configWeight) {
      return;
    }

    const traceId = RequestContext.getTraceId();
    const spanId = RequestContext.getSpanId();

    const event: StructuredLogEvent = {
      timestamp: new Date().toISOString(),
      level,
      category: this.categoryName,
      message,
      traceId,
      spanId,
      durationMs,
      memoryDeltaMB,
      data,
    };

    const formatted = formatLogEvent(event);

    if (level === 'error' || level === 'fatal') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.info(formatted);
    }
  }

  public trace(message: string, data?: Record<string, unknown>): void {
    this.log('trace', message, data);
  }

  public debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  public info(
    message: string,
    data?: Record<string, unknown>,
    durationMs?: number,
    memoryDeltaMB?: number
  ): void {
    this.log('info', message, data, durationMs, memoryDeltaMB);
  }

  public warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  public error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  public fatal(message: string, data?: Record<string, unknown>): void {
    this.log('fatal', message, data);
  }
}

/**
 * Global structured logging root engine. Provides direct category selection and default service logging.
 */
class ObservabilityLogger extends CategoryLogger {
  private categoryLoggers: Map<LogCategory, CategoryLogger> = new Map();

  constructor() {
    super('SERVICE');
  }

  /**
   * Returns a category-scoped logger instance (e.g., logger.category('DATABASE').info(...)).
   */
  public category(cat: LogCategory): CategoryLogger {
    let child = this.categoryLoggers.get(cat);
    if (!child) {
      child = new CategoryLogger(cat);
      this.categoryLoggers.set(cat, child);
    }
    return child;
  }
}

export const logger = new ObservabilityLogger();
