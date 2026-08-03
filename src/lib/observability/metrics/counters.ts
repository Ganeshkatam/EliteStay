/**
 * Prometheus-compatible operational counters for tracking cumulative events across bounded contexts.
 */
export class MetricCounter {
  private count = 0;
  private labeledCounts: Map<string, number> = new Map();

  constructor(
    public readonly name: string,
    public readonly help: string
  ) {}

  public inc(value = 1, labels?: Record<string, string>): void {
    if (labels) {
      const key = JSON.stringify(labels);
      const current = (this.labeledCounts.get(key) || 0) + value;
      this.labeledCounts.set(key, current);
    } else {
      this.count += value;
    }
  }

  public get(labels?: Record<string, string>): number {
    if (labels) {
      return this.labeledCounts.get(JSON.stringify(labels)) ?? 0;
    }
    return this.count;
  }
}

export const requestCounter = new MetricCounter(
  'http_requests_total',
  'Total executed HTTP requests and actions'
);
export const dbQueryCounter = new MetricCounter(
  'db_queries_total',
  'Total executed persistence queries'
);
export const errorCounter = new MetricCounter(
  'errors_total',
  'Total operational failures and exceptions'
);
export const cacheHitCounter = new MetricCounter(
  'cache_hits_total',
  'Total successful cache retrievals'
);
export const cacheMissCounter = new MetricCounter(
  'cache_misses_total',
  'Total cache retrieval failures or bypasses'
);
