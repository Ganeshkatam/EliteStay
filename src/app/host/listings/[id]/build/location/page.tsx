import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LocationForm } from '@/features/host/components/LocationForm';

export const metadata = {
  title: 'Step 2: Location - Build Listing',
};

export default async function LocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify ownership
  const { data: listing } = await supabase
    .from('listings')
    .select('id, host_id')
    .eq('id', id)
    .single();

  if (!listing) redirect('/host/listings');

  // Fetch location data if it exists
  const { data: location } = await supabase
    .from('listing_locations')
    .select('*')
    .eq('listing_id', id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Where's your place located?</h1>
        <p className="text-slate-500 mt-1">Guests will only get your exact address once they've booked a reservation.</p>
      </div>

      <LocationForm 
        listingId={id} 
        initialData={{
          country: location?.country || 'India', // Default to India for V1
          state: location?.state || '',
          city: location?.city || '',
          locality: location?.locality || '',
          postal_code: location?.postal_code || '',
          address_line1: location?.address_line1 || '',
        }}
      />
    </div>
  );
}
