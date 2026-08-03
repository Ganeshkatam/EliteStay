import {
  LogCategory,
  SpanNode,
  SpanMetadata,
  ExecutionStatus,
  ResourceSnapshot,
} from '../types/observability.types';
import {
  beginResourceTracking,
  endResourceTracking,
  ResourceTracker,
  getMemoryConsumptionMB,
} from '../utils/resource-snapshot';
import { generateSpanId } from '../tracing/correlation-id';
import { ObservabilityConfig } from '@/lib/config/observability.config';

/**
 * Represents an active execution unit (Span) within a distributed trace hierarchy.
 * Tracks memory consumption, CPU deltas, duration, metadata, and nested child spans.
 */
export class Span {
  public readonly spanId: string;
  public readonly parentSpanId: string | null;
  public readonly traceId: string;
  public readonly name: string;
  public readonly category: LogCategory;
  public readonly startTimestamp: number;

  private resourceTracker: ResourceTracker;
  private metadata: SpanMetadata = {};
  private children: SpanNode[] = [];
  private warnings: string[] = [];
  private status: ExecutionStatus = 'SUCCESS';
  private errorMessage?: string;
  private errorStack?: string;
  private isCompleted = false;
  private completedSnapshot: ResourceSnapshot | null = null;

  constructor(
    name: string,
    category: LogCategory,
    traceId: string,
    parentSpanId: string | null = null,
    initialMetadata: SpanMetadata = {}
  ) {
    this.spanId = generateSpanId();
    this.parentSpanId = parentSpanId;
    this.traceId = traceId;
    this.name = name;
    this.category = category;
    this.metadata = { ...initialMetadata };
    this.resourceTracker = beginResourceTracking();
    this.startTimestamp = Date.now();
  }

  /**
   * Appends or updates metadata properties on this Span.
   */
  public setAttribute(key: string, value: unknown): this {
    if (!this.isCompleted) {
      this.metadata[key] = value;
    }
    return this;
  }

  /**
   * Merges multiple metadata attributes at once.
   */
  public setAttributes(attributes: SpanMetadata): this {
    if (!this.isCompleted) {
      this.metadata = { ...this.metadata, ...attributes };
    }
    return this;
  }

  /**
   * Registers a domain tag (e.g., user.id, listing.id) in span metadata tags.
   */
  public setTag(key: string, value: string | number | boolean): this {
    if (!this.isCompleted) {
      this.metadata.tags = { ...(this.metadata.tags ?? {}), [key]: value };
    }
    return this;
  }

  /**
   * Adds a non-fatal warning tag to this span.
   */
  public addWarning(message: string): this {
    if (!this.warnings.includes(message)) {
      this.warnings.push(message);
      if (this.status === 'SUCCESS') {
        this.status = 'WARNING';
      }
    }
    return this;
  }

  /**
   * Marks this span as failed and attaches exception stack traces.
   */
  public recordException(error: unknown): this {
    this.status = 'ERROR';
    if (error instanceof Error) {
      this.errorMessage = error.message;
      this.errorStack = error.stack;
    } else {
      this.errorMessage = String(error);
    }
    return this;
  }

  /**
   * Registers a finalized child span node directly under this span in the execution tree.
   */
  public addChild(childNode: SpanNode): void {
    this.children.push(childNode);
  }

  /**
   * Concludes this span's timer and captures ending RAM and CPU snapshots.
   */
  public finish(customStatus?: ExecutionStatus): SpanNode {
    if (this.isCompleted && this.completedSnapshot) {
      return this.toNode();
    }

    if (customStatus) {
      this.status = customStatus;
    }

    const diff = endResourceTracking(this.resourceTracker);

    // Check slow request thresholds for root or major service execution spans
    if (this.category === 'REQUEST' || this.category === 'ACTION') {
      if (diff.durationMs >= ObservabilityConfig.criticalRequestThresholdMs) {
        this.addWarning(
          `Critical Bottleneck: Duration (${diff.durationMs}ms) exceeded critical threshold (${ObservabilityConfig.criticalRequestThresholdMs}ms)`
        );
      } else if (
        diff.durationMs >= ObservabilityConfig.slowRequestThresholdMs
      ) {
        this.addWarning(
          `Slow Request: Duration (${diff.durationMs}ms) exceeded slow threshold (${ObservabilityConfig.slowRequestThresholdMs}ms)`
        );
      }
    }

    this.completedSnapshot = {
      startTimestamp: this.startTimestamp,
      endTimestamp: Date.now(),
      durationMs: diff.durationMs,
      memoryBeforeMB: diff.memoryBeforeMB,
      memoryAfterMB: diff.memoryAfterMB,
      memoryDeltaMB: diff.memoryDeltaMB,
      cpuUserMs: diff.cpuUserMs,
      cpuSystemMs: diff.cpuSystemMs,
      status: this.status,
      warnings: [...this.warnings],
      errorMessage: this.errorMessage,
      errorStack: this.errorStack,
    };

    this.isCompleted = true;
    return this.toNode();
  }

  /**
   * Converts the active span into an immutable serializable SpanNode representation.
   */
  public toNode(): SpanNode {
    const snapshot: ResourceSnapshot = this.completedSnapshot ?? {
      startTimestamp: this.startTimestamp,
      memoryBeforeMB: this.resourceTracker.startMemoryMB,
      memoryAfterMB: getMemoryConsumptionMB(),
      status: this.status,
      warnings: [...this.warnings],
      errorMessage: this.errorMessage,
      errorStack: this.errorStack,
    };

    return {
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      traceId: this.traceId,
      name: this.name,
      category: this.category,
      snapshot,
      metadata: { ...this.metadata },
      children: [...this.children],
    };
  }
}
