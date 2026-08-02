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
      'id, host_id, accommodation_type_id, occupancy_type, furnishing, gender_preference, max_occupants, listing_amenities(amenity_id)'
    )
    .eq('id', id)
    .single();

  if (!listing) redirect('/host/listings');

  // Fetch curated amenities tailored to this listing's accommodation_type_id
  let amenities: {
    id: string;
    name: string;
    icon_name?: string;
    category: string;
  }[] = [];

  if (listing.accommodation_type_id) {
    const { data: typeAmenities } = await supabase
      .from('accommodation_type_amenities')
      .select(
        'category, display_order, is_default, is_required, amenities(id, name, icon)'
      )
      .eq('accommodation_type_id', listing.accommodation_type_id)
      .order('display_order', { ascending: true });

    if (typeAmenities && typeAmenities.length > 0) {
      amenities = typeAmenities
        .filter(
          (
            ta
          ): ta is typeof ta & {
            amenities: { id: string; name: string; icon: string | null };
          } => Boolean(ta.amenities)
        )
        .map((ta) => ({
          id: ta.amenities.id,
          name: ta.amenities.name,
          icon_name: ta.amenities.icon || undefined,
          category: ta.category || 'Basic',
        }));
    }
  }

  // Fallback to master catalog if no specific mapping exists
  if (amenities.length === 0) {
    const { data: allAmenities } = await supabase
      .from('amenities')
      .select('id, name, icon')
      .order('name');

    amenities = (allAmenities || []).map((a) => ({
      id: a.id,
      name: a.name,
      icon_name: a.icon || undefined,
      category: 'General',
    }));
  }

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
