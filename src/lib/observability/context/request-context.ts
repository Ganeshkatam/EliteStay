import { AsyncLocalStorage } from 'node:async_hooks';
import { Span } from '../spans/span';
import { SpanNode } from '../types/observability.types';

export interface ActiveTraceContext {
  traceId: string;
  name: string;
  rootSpan: Span;
  registerSpanNode(node: SpanNode, parentSpanId: string | null): void;
  setAttribute(key: string, value: unknown): void;
  setTag(key: string, value: string | number | boolean): void;
}

interface ContextState {
  trace: ActiveTraceContext;
  activeSpan: Span;
  spanStack: Span[];
}

/**
 * AsyncLocalStorage container providing automatic propagation of Trace IDs, correlation context,
 * and active parent Spans across asynchronous service invocations and database queries.
 */
class RequestContextManager {
  private asyncStorage = new AsyncLocalStorage<ContextState>();

  /**
   * Executes a callback function within a newly initialized Trace root context.
   */
  public runWithTrace<T>(
    trace: ActiveTraceContext,
    callback: () => Promise<T> | T
  ): Promise<T> | T {
    const state: ContextState = {
      trace,
      activeSpan: trace.rootSpan,
      spanStack: [trace.rootSpan],
    };
    return this.asyncStorage.run(state, callback);
  }

  /**
   * Executes a nested callback within a child Span context, making it the active parent for downstream operations.
   */
  public runWithSpan<T>(
    span: Span,
    callback: () => Promise<T> | T
  ): Promise<T> | T {
    const current = this.asyncStorage.getStore();
    if (!current) {
      // If invoked outside a trace, run without context mutation
      return callback();
    }

    const nextState: ContextState = {
      trace: current.trace,
      activeSpan: span,
      spanStack: [...current.spanStack, span],
    };

    return this.asyncStorage.run(nextState, callback);
  }

  /**
   * Retrieves the current active trace context if executing inside an observed request or server action.
   */
  public getActiveTrace(): ActiveTraceContext | undefined {
    return this.asyncStorage.getStore()?.trace;
  }

  /**
   * Retrieves the current active Span (parent for any new child operations).
   */
  public getActiveSpan(): Span | undefined {
    return this.asyncStorage.getStore()?.activeSpan;
  }

  /**
   * Returns the current active Trace ID or undefined if uninstrumented.
   */
  public getTraceId(): string | undefined {
    return this.asyncStorage.getStore()?.trace.traceId;
  }

  /**
   * Returns the current active Span ID or undefined if uninstrumented.
   */
  public getSpanId(): string | undefined {
    return this.asyncStorage.getStore()?.activeSpan.spanId;
  }

  /**
   * Attaches a metadata property directly to the currently executing span or root trace.
   */
  public setAttribute(key: string, value: unknown): void {
    const store = this.asyncStorage.getStore();
    if (store) {
      store.activeSpan.setAttribute(key, value);
    }
  }

  /**
   * Attaches a searchable domain tag (e.g. user.id, listing.id, booking.id) to the active Trace and Span.
   */
  public setTag(key: string, value: string | number | boolean): void {
    const store = this.asyncStorage.getStore();
    if (store) {
      store.trace.setTag(key, value);
      store.activeSpan.setTag(key, value);
    }
  }
}

export const RequestContext = new RequestContextManager();
