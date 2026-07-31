import { createClient } from '@/lib/supabase/server';
import { CalendarView } from '@/features/bookings/components/CalendarView';

export default async function HostCalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch all host listings
  const { data: listings } = await supabase
    .from('listings')
    .select('id, title')
    .eq('host_id', user.id);

  // Fetch all stays for those listings
  const { data: stays } = await supabase
    .from('stays')
    .select('id, listing_id, expected_move_in_date, expected_move_out_date, status')
    .in('listing_id', listings?.map(l => l.id) || [])
    .in('status', ['upcoming', 'active']);

  // Fetch all pending bookings (optional, just to show blocked/pending)
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, listing_id, requested_move_in, requested_duration, status')
    .in('listing_id', listings?.map(l => l.id) || [])
    .eq('status', 'pending');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability Calendar</h1>
          <p className="mt-2 text-sm text-gray-700">
            View occupied dates and upcoming stays across your properties.
          </p>
        </div>
      </div>
      
      <CalendarView 
        listings={listings || []} 
        stays={stays || []} 
        bookings={bookings || []} 
      />
    </div>
  );
}
