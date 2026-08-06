import { getProvider } from '@/lib/redis/client';
import { isCircuitClosed } from '@/lib/redis/circuit-breaker';
import { KEY_PREFIX } from '@/lib/redis/config';

export const dynamic = 'force-dynamic';

export default async function RedisInspectorPage() {
  const provider = getProvider();

  let pingOk = false;
  let status = 'CIRCUIT_OPEN';

  if (isCircuitClosed()) {
    status = 'CONNECTED';
    pingOk = await provider.ping();
  }

  // NOTE: This uses generic provider methods if we add them,
  // but for a simple inspector we can just show connection status.
  // In a real production inspector, we'd add `keys()` to the provider interface
  // or use an internal query mechanism. For now, this is a basic diagnostic view.

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Redis Platform Inspector</h1>
        <p className="text-gray-500 mt-2">
          Real-time view of the EliteStay cache subsystem.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Connection Status
          </h2>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${pingOk ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-2xl font-semibold">
              {pingOk ? 'Healthy' : 'Unhealthy'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Circuit Breaker: <strong>{status}</strong>
          </p>
        </div>

        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Cache Configuration
          </h2>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>
              Namespace Prefix:{' '}
              <code className="bg-gray-100 px-1 py-0.5 rounded">
                {KEY_PREFIX}
              </code>
            </li>
            <li>
              Metrics Endpoint:{' '}
              <a href="/api/metrics" className="text-blue-600 hover:underline">
                /api/metrics
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-6 bg-gray-50 border rounded-lg shadow-sm text-sm text-gray-600">
        <h3 className="font-semibold mb-2">Note on Key Inspection</h3>
        <p>
          Key scanning is disabled in the production provider to prevent
          blocking operations. For deep inspection, use the Upstash console or
          run local benchmarks.
        </p>
      </div>
    </div>
  );
}
