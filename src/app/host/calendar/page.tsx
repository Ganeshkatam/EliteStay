import { createClient } from '@/lib/supabase/server';
import { CalendarWorkspace } from '@/features/host/components/CalendarWorkspace';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const metadata = {
  title: 'Calendar Workspace - Host - EliteStay',
};

export default async function HostCalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch Listings
  const { data: listings } = await supabase
    .from('listings')
    .select(
      'id, title, public_id, status, city, locality, images:listing_images(storage_path)'
    )
    .eq('host_id', user.id);

  const rawListings = listings || [];
  const listingIds = rawListings.map((l) => l.id);

  // 2. Fetch Stays (Move-ins, Move-outs)
  const { data: stays } = await supabase
    .from('stays')
    .select(
      `
      id, 
      listing_id, 
      expected_move_in_date, 
      expected_move_out_date, 
      status,
      guest_profiles!stays_guest_id_fkey(full_name)
    `
    )
    .in('listing_id', listingIds)
    .in('status', ['upcoming', 'active'])
    .gte('expected_move_out_date', new Date().toISOString().split('T')[0]); // Only current and future

  // 3. Fetch Pending Bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      `
      id, 
      listing_id, 
      requested_move_in, 
      requested_duration, 
      status,
      guest_profiles!bookings_guest_id_fkey(full_name)
    `
    )
    .in('listing_id', listingIds)
    .eq('status', 'pending');

  // 4. Fetch Manual Blocks / Availability Rules
  const { data: availability } = await supabase
    .from('listing_availability')
    .select('id, listing_id, start_date, end_date, status, source')
    .in('listing_id', listingIds)
    .gte('end_date', new Date().toISOString().split('T')[0]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Calendar Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your long-term availability, move-ins, and maintenance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white">
            Manage Sync
          </Button>
          <Button className="bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" />
            Add Block
          </Button>
        </div>
      </div>

      <CalendarWorkspace
        listings={
          rawListings as unknown as import('@/features/host/components/CalendarWorkspace').TimelineListing[]
        }
        stays={
          (stays as unknown as import('@/features/host/components/CalendarWorkspace').TimelineStay[]) ||
          []
        }
        bookings={
          (bookings as unknown as import('@/features/host/components/CalendarWorkspace').TimelineBooking[]) ||
          []
        }
        availability={
          (availability as unknown as import('@/features/host/components/CalendarWorkspace').TimelineAvailability[]) ||
          []
        }
      />
    </div>
  );
}
