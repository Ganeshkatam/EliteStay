import { ObservabilityDashboard } from '@/features/admin/components/ObservabilityDashboard';
import {
  memoryTraceRepository,
  businessEvents,
  exceptionFingerprints,
} from '@/lib/observability';

export const dynamic = 'force-dynamic';

export default async function ObservabilityPage() {
  // Fetch real-time operational data directly from our in-memory repositories
  const recentTraces = memoryTraceRepository.query({ limit: 100 });
  const events = businessEvents.getRecentEvents(100);
  const fingerprints = exceptionFingerprints.getFingerprints();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Platform Observability
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor system health, bottleneck diagnostics, exception signatures,
          and real-time business events.
        </p>
      </div>

      <ObservabilityDashboard
        traces={recentTraces}
        businessEvents={events}
        exceptionFingerprints={fingerprints}
      />
    </div>
  );
}
