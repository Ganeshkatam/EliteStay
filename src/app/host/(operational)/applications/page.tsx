import { getHostApplicationsAction } from '@/features/host/applications/actions/host-application.actions';
import { HostApplicationsList } from '@/features/host/applications/components/HostApplicationsList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rental Applications | EliteStay Host',
};

export default async function HostApplicationsPage() {
  const applications = await getHostApplicationsAction();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Rental Applications
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage rental applications for your properties.
          </p>
        </div>
      </div>

      <HostApplicationsList initialApplications={applications} />
    </div>
  );
}
