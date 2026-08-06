import { requireUser } from '@/features/auth/server/auth-helpers';
import { HostLeaseViewModelFactory } from '@/features/host/leases/api/lease-view-model.factory';
import { HostLeaseWorkspace } from '@/features/host/leases/components/HostLeaseWorkspace';

export const metadata = {
  title: 'Leases | EliteStay Host',
  description: 'Manage your property leases and move-ins.',
};

export default async function HostLeasesPage() {
  const user = await requireUser();

  const leases = await HostLeaseViewModelFactory.createForHost(user.id);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Leases & Move-Ins
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Draft and issue leases, track security deposits, and manage resident
          move-ins.
        </p>
      </div>

      <HostLeaseWorkspace leases={leases} />
    </div>
  );
}
