import { getHostBookings } from '@/features/bookings/api/queries';
import { BookingRequestList } from '@/features/bookings/components/BookingRequestList';

export default async function HostBookingsPage() {
  const bookings = await getHostBookings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage incoming booking requests for all your listings.
          </p>
        </div>
      </div>
      
      <BookingRequestList initialBookings={bookings} />
    </div>
  );
}
