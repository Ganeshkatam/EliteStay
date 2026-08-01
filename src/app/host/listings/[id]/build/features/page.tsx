import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FeaturesForm } from '@/features/host/components/FeaturesForm';

export const metadata = {
  title: 'Step 3: Features - Build Listing',
};

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify ownership and get base feature values
  const { data: listing } = await supabase
    .from('listings')
    .select(
      'id, host_id, occupancy_type, furnishing, gender_preference, max_occupants, listing_amenities(amenity_id)'
    )
    .eq('id', id)
    .single();

  if (!listing) redirect('/host/listings');

  // Fetch all available amenities grouped by category
  const { data: amenities } = await supabase
    .from('amenities')
    .select('id, name, icon_name, category')
    .order('category')
    .order('name');

  // Format existing amenities
  const selectedAmenities =
    listing.listing_amenities?.map(
      (la: { amenity_id: string }) => la.amenity_id
    ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Features & Amenities
        </h1>
        <p className="text-slate-500 mt-1">
          Let guests know what your property offers.
        </p>
      </div>

      <FeaturesForm
        listingId={id}
        initialData={{
          occupancy_type: listing.occupancy_type || 'private',
          furnishing: listing.furnishing || 'semi_furnished',
          gender_preference: listing.gender_preference || 'any',
          max_occupants: listing.max_occupants || 1,
          amenity_ids: selectedAmenities,
        }}
        amenities={amenities || []}
      />
    </div>
  );
}
