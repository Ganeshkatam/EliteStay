import { getGuestStays } from '@/features/stays/api/queries';
import { StayList } from '@/features/stays/components/StayList';

export default async function GuestTripsPage() {
  const stays = await getGuestStays();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Trips</h1>
          <p className="mt-2 text-sm text-gray-700">
            View your upcoming, active, and past stays.
          </p>
        </div>
      </div>
      
      <StayList initialStays={stays} viewType="guest" />
    </div>
  );
}
