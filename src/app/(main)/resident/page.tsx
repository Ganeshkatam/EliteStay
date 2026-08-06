import { requireUser } from '@/features/auth/server/auth-helpers';
import { ResidentViewModelFactory } from '@/features/resident/portal/api/resident-view-model.factory';
import { ResidentDashboard } from '@/features/resident/portal/components/ResidentDashboard';

export const metadata = {
  title: 'Resident Portal | EliteStay',
  description: 'Manage your lease, security deposit, and move-in process.',
};

export default async function ResidentPortalPage() {
  const user = await requireUser();

  const viewModel = await ResidentViewModelFactory.createForTenant(user.id);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Resident Portal
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your tenancy, track your move-in progress, and access your
          lease documents.
        </p>
      </div>

      <ResidentDashboard viewModel={viewModel} />
    </div>
  );
}
