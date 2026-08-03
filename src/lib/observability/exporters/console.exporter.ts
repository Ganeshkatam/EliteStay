import { TelemetryExporter, TraceRecord } from '../types/observability.types';
import { ObservabilityConfig } from '@/lib/config/observability.config';
import { RequestSummaryBuilder } from '../summary/request-summary.builder';

/**
 * Exports completed traces directly to the local CLI console using formatted ASCII box breakdowns and execution trees.
 */
export class ConsoleExporter implements TelemetryExporter {
  public export(trace: TraceRecord): void {
    if (
      !ObservabilityConfig.exporters.console ||
      ObservabilityConfig.environment === 'testing'
    ) {
      return;
    }

    const summary = RequestSummaryBuilder.build(trace);

    // Print summary box
    console.info(summary.formattedBox);

    // In development or when warnings/errors occur, print the hierarchical execution tree
    if (
      ObservabilityConfig.environment === 'development' ||
      summary.warningCount > 0 ||
      summary.errorCount > 0 ||
      summary.totalDurationMs >= ObservabilityConfig.slowRequestThresholdMs
    ) {
      console.info(
        `\nExecution Tree [${trace.name}]:\n${summary.executionTree}\n`
      );
    }
  }
}

export const consoleExporter = new ConsoleExporter();
