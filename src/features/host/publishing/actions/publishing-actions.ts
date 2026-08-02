'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { LocationService } from '@/features/location/services/location-service';
import { PublishingService } from '../services/publishing.service';

export async function publishListing(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  await PublishingService.publish(supabase, listingId, user.id);

  revalidatePath('/s');
  revalidatePath('/host/listings');
  revalidatePath(`/host/listings/${listingId}`);
}

export async function unpublishListing(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  await PublishingService.unpublish(supabase, listingId, user.id);

  revalidatePath('/s');
  revalidatePath('/host/listings');
  revalidatePath(`/host/listings/${listingId}`);
}

export async function saveAccommodation(
  listingId: string,
  data: {
    title: string;
    description: string;
    accommodation_type_id: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('listings')
    .update({
      title: data.title,
      description: data.description,
      accommodation_type_id: data.accommodation_type_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .eq('host_id', user.id);

  if (error) {
    console.error('Error saving accommodation:', error);
    throw new Error('Failed to save accommodation details');
  }

  revalidatePath(`/host/listings/${listingId}/build`);
  return { success: true };
}

export async function saveLocation(
  listingId: string,
  data: {
    state: string;
    city: string;
    locality: string;
    postal_code: string;
    address_line1: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: listing } = await supabase
    .from('listings')
    .select(
      'id, state, city, locality, postal_code, formatted_address, latitude, longitude'
    )
    .eq('id', listingId)
    .eq('host_id', user.id)
    .single();

  if (!listing) throw new Error('Unauthorized or listing not found');

  let latitude = listing.latitude;
  let longitude = listing.longitude;
  let formatted_address = listing.formatted_address || data.address_line1;

  const addressChanged =
    listing.state !== data.state ||
    listing.city !== data.city ||
    listing.locality !== data.locality ||
    listing.postal_code !== data.postal_code ||
    !listing.latitude ||
    !listing.longitude;

  if (addressChanged) {
    try {
      const fullAddress = `${data.address_line1}, ${data.locality}, ${data.city}, ${data.state}, India`;
      const geocodeResult = await LocationService.geocode(fullAddress);
      latitude = geocodeResult.latitude;
      longitude = geocodeResult.longitude;
      formatted_address = geocodeResult.formattedAddress;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error(
        'We could not locate this address. Please double check the details.'
      );
    }
  }

  const { error: updateError } = await supabase
    .from('listings')
    .update({
      state: data.state,
      city: data.city,
      locality: data.locality,
      postal_code: data.postal_code,
      formatted_address,
      latitude,
      longitude,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .eq('host_id', user.id);

  if (updateError) throw new Error('Failed to update location');

  revalidatePath(`/host/listings/${listingId}/build`);
  return { success: true };
}

export async function saveFeatures(
  listingId: string,
  data: {
    occupancy_type: 'private' | 'shared' | 'mixed';
    furnishing: 'unfurnished' | 'semi_furnished' | 'fully_furnished';
    gender_preference: 'any' | 'male' | 'female';
    max_occupants: number;
    amenity_ids: string[];
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: listing } = await supabase
    .from('listings')
    .select('id')
    .eq('id', listingId)
    .eq('host_id', user.id)
    .single();

  if (!listing) throw new Error('Unauthorized or listing not found');

  const { error: listingError } = await supabase
    .from('listings')
    .update({
      occupancy_type: data.occupancy_type,
      furnishing: data.furnishing,
      gender_preference: data.gender_preference,
      max_occupants: data.max_occupants,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId);

  if (listingError) throw new Error('Failed to update listing features');

  await supabase.from('listing_amenities').delete().eq('listing_id', listingId);

  if (data.amenity_ids.length > 0) {
    const amenitiesToInsert = data.amenity_ids.map((id) => ({
      listing_id: listingId,
      amenity_id: id,
    }));

    const { error: amenitiesError } = await supabase
      .from('listing_amenities')
      .insert(amenitiesToInsert);

    if (amenitiesError) throw new Error('Failed to save amenities');
  }

  revalidatePath(`/host/listings/${listingId}/build`);
  return { success: true };
}

export async function savePricing(
  listingId: string,
  data: {
    amount: number;
    billing_period: 'day' | 'week' | 'month' | 'semester' | 'year';
    security_deposit: number;
    maintenance_fee: number;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: listing } = await supabase
    .from('listings')
    .select('id')
    .eq('id', listingId)
    .eq('host_id', user.id)
    .single();

  if (!listing) throw new Error('Unauthorized or listing not found');

  const { data: existingPrice } = await supabase
    .from('listing_prices')
    .select('id')
    .eq('listing_id', listingId)
    .single();

  if (existingPrice) {
    const { error } = await supabase
      .from('listing_prices')
      .update({
        amount: data.amount,
        billing_period: data.billing_period,
        security_deposit: data.security_deposit,
        maintenance_fee: data.maintenance_fee,
        currency: 'INR',
        minimum_duration: 1,
      })
      .eq('id', existingPrice.id);

    if (error) throw new Error('Failed to update pricing');
  } else {
    const { error } = await supabase.from('listing_prices').insert({
      listing_id: listingId,
      amount: data.amount,
      billing_period: data.billing_period,
      security_deposit: data.security_deposit,
      maintenance_fee: data.maintenance_fee,
      currency: 'INR',
      minimum_duration: 1,
    });

    if (error) throw new Error('Failed to insert pricing');
  }

  revalidatePath(`/host/listings/${listingId}/build`);
  return { success: true };
}
