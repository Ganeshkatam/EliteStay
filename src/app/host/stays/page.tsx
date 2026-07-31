import { getHostStays } from '@/features/stays/api/queries';
import { StayList } from '@/features/stays/components/StayList';

export default async function HostStaysPage() {
  const stays = await getHostStays();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active & Upcoming Stays</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your tenants, handle check-ins, and view completed stays.
          </p>
        </div>
      </div>
      
      <StayList initialStays={stays} viewType="host" />
    </div>
  );
}
