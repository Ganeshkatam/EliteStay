import { getMemoryConsumptionMB } from '../utils/resource-snapshot';

/**
 * Prometheus-compatible metric gauges tracking current operational state values (RAM heap, pool sizes).
 */
export class MetricGauge {
  private currentValue = 0;

  constructor(
    public readonly name: string,
    public readonly help: string
  ) {}

  public set(value: number): void {
    this.currentValue = value;
  }

  public inc(delta = 1): void {
    this.currentValue += delta;
  }

  public dec(delta = 1): void {
    this.currentValue -= delta;
  }

  public get(): number {
    if (this.name === 'memory_heap_used_mb') {
      return getMemoryConsumptionMB();
    }
    return this.currentValue;
  }
}

export const activeRequestsGauge = new MetricGauge(
  'active_requests_total',
  'Number of currently in-flight requests'
);
export const memoryGauge = new MetricGauge(
  'memory_heap_used_mb',
  'Current node process memory consumption in Megabytes'
);
