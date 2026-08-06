import { DevCacheDiagnostics } from '@/features/admin/cache/components/DevCacheDiagnostics';

export const metadata = {
  title: 'Development Cache Diagnostics | EliteStay Admin',
};

export default function AdminDevCachePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Cache Engine Diagnostics
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Real-time insights into the Redis caching layer and circuit breaker
          state.
        </p>
      </div>

      <DevCacheDiagnostics />
    </div>
  );
}
