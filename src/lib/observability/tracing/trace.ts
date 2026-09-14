import { TraceRecord, SpanNode } from '../types/observability.types';
import { Span } from '../spans/span';
import { generateCorrelationId } from './correlation-id';
import {
  shouldSampleTrace,
  ObservabilityConfig,
} from '@/lib/config/observability.config';
import { analyzeSlowRequests } from '../analysis/slow-request';
import { analyzeDuplicateQueries } from '../analysis/duplicate-query';
import { analyzeNPlusOne } from '../analysis/n-plus-one';
import { memoryTraceRepository } from '../repository/memory.repository';
import { consoleExporter } from '../exporters/console.exporter';
import { jsonExporter } from '../exporters/json.exporter';
import { otelExporter } from '../exporters/otel.exporter';
import { ActiveTraceContext } from '../context/request-context';

/**
 * Manages the complete lifecycle of an observed request, server action, or background job.
 * Coordinates span tree reconstruction, heuristic bottleneck analysis, ring buffer storage, and telemetry exporters.
 */
export class Trace implements ActiveTraceContext {
  public readonly traceId: string;
  public readonly name: string;
  public readonly startTime: number;
  public readonly rootSpan: Span;
  public metadata: Record<string, unknown> = {};
  public tags: Record<string, string | number | boolean> = {};

  private allSpans: SpanNode[] = [];
  private nodeMap: Map<string, SpanNode> = new Map();
  private warnings: string[] = [];
  private errors: string[] = [];
  private isFinished = false;

  constructor(name: string, initialMetadata: Record<string, unknown> = {}) {
    this.traceId = generateCorrelationId();
    this.name = name;
    this.startTime = Date.now();
    this.metadata = { ...initialMetadata };
    this.rootSpan = new Span(
      name,
      'REQUEST',
      this.traceId,
      null,
      initialMetadata
    );
  }

  public setAttribute(key: string, value: unknown): void {
    if (!this.isFinished) {
      this.metadata[key] = value;
      this.rootSpan.setAttribute(key, value);
    }
  }

  public setTag(key: string, value: string | number | boolean): void {
    if (!this.isFinished) {
      this.tags[key] = value;
      this.rootSpan.setTag(key, value);
    }
  }

  public registerSpanNode(node: SpanNode, parentSpanId: string | null): void {
    if (this.isFinished) return;

    this.allSpans.push(node);
    this.nodeMap.set(node.spanId, node);

    if (node.snapshot.status === 'ERROR' && node.snapshot.errorMessage) {
      this.errors.push(`[${node.name}] ${node.snapshot.errorMessage}`);
    }
    for (const warn of node.snapshot.warnings) {
      if (!this.warnings.includes(warn)) {
        this.warnings.push(`[${node.name}] ${warn}`);
      }
    }
  }

  /**
   * Concludes the trace, runs analysis heuristics (slow requests, duplicate queries, N+1 loops), and exports telemetry.
   */
  public async finish(): Promise<TraceRecord> {
    if (this.isFinished) {
      throw new Error('[Trace] Attempted to finish an already finished trace.');
    }

    const rootNode = this.rootSpan.finish();
    const endTime = Date.now();
    const durationMs = rootNode.snapshot.durationMs ?? endTime - this.startTime;

    const record: TraceRecord = {
      traceId: this.traceId,
      name: this.name,
      startTime: this.startTime,
      endTime,
      durationMs,
      rootSpan: rootNode,
      allSpans: [rootNode, ...this.allSpans],
      warnings: [...this.warnings, ...rootNode.snapshot.warnings],
      errors: [...this.errors],
      metadata: { ...this.metadata },
      tags: { ...this.tags },
      version: {
        gitCommit:
          process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
          process.env.GIT_COMMIT ||
          'development',
        buildVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        deployment: process.env.VERCEL_URL
          ? `vercel-${process.env.VERCEL_URL}`
          : 'local-workspace',
        environment: ObservabilityConfig.environment,
      },
    };

    this.isFinished = true;

    // Run automated analysis heuristics on the full span graph
    analyzeSlowRequests(record);
    analyzeDuplicateQueries(record);
    analyzeNPlusOne(record);

    // Evaluate sampling policy
    const hasErrors = record.errors.length > 0;
    if (shouldSampleTrace(hasErrors, durationMs)) {
      // Store in memory ring-buffer for Phase 5 internal dashboard monitoring
      memoryTraceRepository.save(record);

      // Transmit to active exporters
      consoleExporter.export(record);
      jsonExporter.export(record);
      await otelExporter.export(record);
    }

    return record;
  }
}
