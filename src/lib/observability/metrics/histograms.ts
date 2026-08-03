/**
 * Prometheus-compatible latency and resource distribution histograms.
 * Tracks performance distributions across standard duration boundaries.
 */
export class MetricHistogram {
  private values: number[] = [];
  private sum = 0;

  constructor(
    public readonly name: string,
    public readonly help: string,
    public readonly buckets: number[] = [10, 25, 50, 100, 250, 500, 1000, 2500]
  ) {}

  public observe(value: number): void {
    this.values.push(value);
    this.sum += value;
  }

  public getStats(): { count: number; sum: number; avg: number; p95: number } {
    const count = this.values.length;
    if (count === 0) {
      return { count: 0, sum: 0, avg: 0, p95: 0 };
    }
    const avg = Math.round((this.sum / count) * 100) / 100;
    const sorted = [...this.values].sort((a, b) => a - b);
    const idx = Math.floor(count * 0.95);
    const p95 = sorted[Math.min(idx, count - 1)] ?? 0;

    return { count, sum: this.sum, avg, p95 };
  }
}

export const requestLatencyHistogram = new MetricHistogram(
  'request_duration_ms',
  'HTTP request and action latency distribution'
);
export const dbLatencyHistogram = new MetricHistogram(
  'db_query_duration_ms',
  'Database query latency distribution'
);
