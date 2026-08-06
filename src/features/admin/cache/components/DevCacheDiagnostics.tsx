'use client';

import { useEffect, useState } from 'react';

interface CacheDiagnosticsData {
  provider: string;
  health: {
    healthy: boolean;
    circuitClosed: boolean;
    details: Record<string, unknown>;
  };
  keys: string[];
  metrics: {
    totalRequests: number;
    hits: number;
    misses: number;
    hitRate: number;
    writes: number;
    staleServes: number;
    dbFallbacks: number;
  };
  memory: { used: number; total: number; usagePercent: number };
}

export function DevCacheDiagnostics() {
  const [data, setData] = useState<CacheDiagnosticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/admin/dev/cache-metrics');
        if (!res.ok) throw new Error('Failed to fetch metrics');
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!data && !error)
    return <div className="p-8 text-neutral-400">Loading Diagnostics...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-medium text-neutral-900 dark:text-neutral-100">
            Local Node Metrics
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Warning: These metrics reflect only the current Node.js instance. In
            production, this data will be disjointed across instances.
          </p>
        </div>
        <div className="text-right text-xs text-neutral-500 dark:text-neutral-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          Error loading metrics: {error}
        </div>
      )}

      {data && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Infrastructure Health */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Infrastructure Health
            </h3>
            <div className="mt-2">
              <div className="flex items-center gap-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">
                Provider:{' '}
                <span className="uppercase text-brand-600 dark:text-brand-400">
                  {data.provider}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Status
                  </span>
                  <span
                    className={`font-medium ${data.health.healthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {data.keys.length > 0 ? 'Online' : 'Degraded/Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Circuit Breaker
                  </span>
                  <span
                    className={`font-medium ${data.health.circuitClosed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {data.health.circuitClosed
                      ? 'CLOSED (Active)'
                      : 'OPEN (Bypassed)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Metrics */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Activity Counters
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Total Writes
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {data.metrics.writes}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Stale SWR Serves
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {data.metrics.staleServes}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  DB Fallbacks (Bypass)
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {data.metrics.dbFallbacks}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
