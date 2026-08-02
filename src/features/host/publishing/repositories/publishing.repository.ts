import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export class PublishingRepository {
  static async getAccommodationSection(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ) {
    const { data: listing } = await supabase
      .from('listings')
      .select('id, title, description, accommodation_type_id, host_id')
      .eq('id', listingId)
      .eq('host_id', hostId)
      .single();

    if (!listing) return null;

    const { data: types } = await supabase
      .from('accommodation_types')
      .select('id, name')
      .order('name');

    return {
      listing,
      accommodationTypes: types || [],
    };
  }

  static async getLocationSection(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ) {
    const { data: listing } = await supabase
      .from('listings')
      .select(
        'id, host_id, state, city, locality, postal_code, formatted_address'
      )
      .eq('id', listingId)
      .eq('host_id', hostId)
      .single();

    if (!listing) return null;

    return {
      location: {
        state: listing.state || '',
        city: listing.city || '',
        locality: listing.locality || '',
        postal_code: listing.postal_code || '',
        address_line1: listing.formatted_address || '',
      },
    };
  }

  static async getFeaturesSection(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ) {
    const { data: listing } = await supabase
      .from('listings')
      .select(
        'id, host_id, accommodation_type_id, occupancy_type, furnishing, gender_preference, max_occupants, listing_amenities(amenity_id)'
      )
      .eq('id', listingId)
      .eq('host_id', hostId)
      .single();

    if (!listing) return null;

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

    const selectedAmenities =
      listing.listing_amenities?.map(
        (la: { amenity_id: string }) => la.amenity_id
      ) || [];

    return {
      features: {
        occupancy_type: listing.occupancy_type || 'private',
        furnishing: listing.furnishing || 'semi_furnished',
        gender_preference: listing.gender_preference || 'any',
        max_occupants: listing.max_occupants || 1,
        amenity_ids: selectedAmenities,
      },
      amenities,
    };
  }

  static async getPricingSection(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ) {
    const { data: listing } = await supabase
      .from('listings')
      .select('id, host_id')
      .eq('id', listingId)
      .eq('host_id', hostId)
      .single();

    if (!listing) return null;

    const { data: pricing } = await supabase
      .from('listing_prices')
      .select('amount, billing_period, security_deposit, maintenance_fee')
      .eq('listing_id', listingId)
      .maybeSingle();

    return {
      pricing: pricing || {
        amount: 0,
        billing_period: 'month' as const,
        security_deposit: 0,
        maintenance_fee: 0,
      },
    };
  }

  static async getImagesSection(
    supabase: SupabaseClient<Database>,
    listingId: string,
    hostId: string
  ) {
    const { data: listing } = await supabase
      .from('listings')
      .select('id, host_id')
      .eq('id', listingId)
      .eq('host_id', hostId)
      .single();

    if (!listing) return null;

    const { data: images } = await supabase
      .from('listing_images')
      .select('*')
      .eq('listing_id', listingId)
      .order('display_order');

    return {
      images: images || [],
    };
  }
}
