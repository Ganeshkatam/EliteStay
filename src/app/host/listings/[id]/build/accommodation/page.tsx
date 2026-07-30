import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AccommodationForm } from '@/features/host/components/AccommodationForm';

export const metadata = {
  title: 'Step 1: Accommodation - Build Listing',
};

export default async function AccommodationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch listing data to populate form
  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, description, accommodation_type_id')
    .eq('id', id)
    .single();

  if (!listing) {
    redirect('/host/listings');
  }

  // Fetch accommodation types for the dropdown
  const { data: types } = await supabase
    .from('accommodation_types')
    .select('id, name')
    .order('name');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tell us about your place</h1>
        <p className="text-slate-500 mt-1">In this step, we'll ask for the basic information about your property.</p>
      </div>

      <AccommodationForm 
        listingId={listing.id} 
        initialData={{
          title: listing.title || '',
          description: listing.description || '',
          accommodation_type_id: listing.accommodation_type_id || '',
        }}
        accommodationTypes={types || []}
      />
    </div>
  );
}
