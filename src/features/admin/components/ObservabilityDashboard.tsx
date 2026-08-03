'use client';

import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Globe,
  ListOrdered,
  FileSearch,
  Fingerprint,
} from 'lucide-react';
import {
  TraceRecord,
  BusinessEvent,
  ExceptionFingerprint,
} from '@/lib/observability';

interface ObservabilityDashboardProps {
  traces: TraceRecord[];
  businessEvents: BusinessEvent[];
  exceptionFingerprints: Array<
    Omit<ExceptionFingerprint, 'affectedRoutes' | 'affectedServices'> & {
      affectedRoutes: string[];
      affectedServices: string[];
    }
  >;
}

export function ObservabilityDashboard({
  traces,
  businessEvents,
  exceptionFingerprints,
}: ObservabilityDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'traces' | 'exceptions' | 'business'
  >('overview');

  const slowTraces = traces.filter((t) => (t.durationMs || 0) > 100);
  const errorTraces = traces.filter((t) => t.errors.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 rounded-xl bg-muted/50 p-1 border">
        {['overview', 'traces', 'exceptions', 'business'].map((tab) => (
          <button
            key={tab}
            onClick={() =>
              setActiveTab(
                tab as 'overview' | 'traces' | 'exceptions' | 'business'
              )
            }
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:bg-background/50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Activity size={18} />
                <span className="font-medium text-sm">Recent Traces</span>
              </div>
              <div className="text-3xl font-bold">{traces.length}</div>
            </div>
            <div className="p-4 bg-amber-50/50 border-amber-100 rounded-lg border">
              <div className="flex items-center gap-2 mb-2 text-amber-700">
                <Globe size={18} />
                <span className="font-medium text-sm">
                  Slow Requests (&gt;100ms)
                </span>
              </div>
              <div className="text-3xl font-bold text-amber-900">
                {slowTraces.length}
              </div>
            </div>
            <div className="p-4 bg-red-50/50 border-red-100 rounded-lg border">
              <div className="flex items-center gap-2 mb-2 text-red-700">
                <AlertTriangle size={18} />
                <span className="font-medium text-sm">Recent Errors</span>
              </div>
              <div className="text-3xl font-bold text-red-900">
                {errorTraces.length}
              </div>
            </div>
            <div className="p-4 bg-blue-50/50 border-blue-100 rounded-lg border">
              <div className="flex items-center gap-2 mb-2 text-blue-700">
                <ListOrdered size={18} />
                <span className="font-medium text-sm">Business Events</span>
              </div>
              <div className="text-3xl font-bold text-blue-900">
                {businessEvents.length}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4">
              Domain Business Events
            </h2>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Event Name</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3 rounded-tr-lg">Trace ID</th>
                </tr>
              </thead>
              <tbody>
                {businessEvents.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No business events recorded yet.
                    </td>
                  </tr>
                )}
                {businessEvents.map((evt) => (
                  <tr
                    key={evt.eventId}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-medium text-blue-700">
                      {evt.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(evt.tags).map(([k, v]) => (
                          <span
                            key={k}
                            className="bg-muted px-2 py-0.5 rounded text-xs"
                          >
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {evt.traceId?.split('-')[0] || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'exceptions' && (
          <div className="overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Fingerprint size={20} /> Exception Fingerprints
            </h2>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Type</th>
                  <th className="px-4 py-3">
                    Signature / Message (Normalized)
                  </th>
                  <th className="px-4 py-3">Count</th>
                  <th className="px-4 py-3 rounded-tr-lg">Affected Routes</th>
                </tr>
              </thead>
              <tbody>
                {exceptionFingerprints.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      System is healthy. No exceptions fingerprinted.
                    </td>
                  </tr>
                )}
                {exceptionFingerprints.map((fp) => (
                  <tr
                    key={fp.fingerprintId}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-medium text-red-600">
                      {fp.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs break-all text-muted-foreground">
                      {fp.signature.substring(0, 120)}
                      {fp.signature.length > 120 ? '...' : ''}
                    </td>
                    <td className="px-4 py-3 font-bold">{fp.count}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {fp.affectedRoutes.map((r) => (
                          <span
                            key={r}
                            className="text-xs bg-red-50 text-red-800 px-1.5 py-0.5 rounded border border-red-100"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'traces' && (
          <div className="overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileSearch size={20} /> Trace Explorer
            </h2>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Latency</th>
                  <th className="px-4 py-3">Memory</th>
                  <th className="px-4 py-3 rounded-tr-lg">Tags</th>
                </tr>
              </thead>
              <tbody>
                {traces.slice(0, 20).map((t) => (
                  <tr
                    key={t.traceId}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {t.traceId.split('-')[0]}
                    </td>
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td
                      className={`px-4 py-3 font-mono text-xs ${(t.durationMs || 0) > 100 ? 'text-amber-600 font-bold' : ''}`}
                    >
                      {t.durationMs}ms
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {t.rootSpan.snapshot.memoryDeltaMB
                        ? `${t.rootSpan.snapshot.memoryDeltaMB > 0 ? '+' : ''}${t.rootSpan.snapshot.memoryDeltaMB}MB`
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(t.tags || {})
                          .slice(0, 3)
                          .map(([k, v]) => (
                            <span
                              key={k}
                              className="bg-muted px-2 py-0.5 rounded text-[10px]"
                            >
                              {k}: {String(v)}
                            </span>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
