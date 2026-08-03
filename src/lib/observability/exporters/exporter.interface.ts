import { TraceRecord, TelemetryExporter } from '../types/observability.types';

export { type TelemetryExporter };

/**
 * Composite dispatcher that fans out trace export execution across all registered active exporters.
 */
export class ExporterDispatcher implements TelemetryExporter {
  private exporters: TelemetryExporter[] = [];

  public register(exporter: TelemetryExporter): void {
    this.exporters.push(exporter);
  }

  public async export(trace: TraceRecord): Promise<void> {
    for (const exporter of this.exporters) {
      try {
        await exporter.export(trace);
      } catch (error) {
        console.error(
          '[TelemetryExporter] Exporter transmission failed:',
          error
        );
      }
    }
  }
}
