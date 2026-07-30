'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Creates a new Draft listing and initializes its build progress.
 * Returns the UUID of the new listing.
 */
export async function createDraftListing() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // 1. Create the base listing row
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert({
      host_id: user.id,
      status: 'draft',
      title: '', // Empty initially
    })
    .select('id')
    .single();

  if (listingError || !listing) {
    console.error('Error creating draft listing:', listingError);
    throw new Error('Failed to create draft listing');
  }

  // 2. Initialize the build progress
  const { error: progressError } = await supabase
    .from('listing_build_progress')
    .insert({
      listing_id: listing.id,
      last_step: 'accommodation',
      percent_complete: 0,
    });

  if (progressError) {
    console.error('Error creating build progress:', progressError);
  }

  revalidatePath('/host/listings');
  revalidatePath('/host');
  
  redirect(`/host/listings/${listing.id}/build/accommodation`);
}

/**
 * Discards an abandoned draft. 
 * Because of ON DELETE CASCADE on our foreign keys (like listing_build_progress),
 * deleting the listing will clean up related progress data.
 */
export async function discardDraftListing(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // We explicitly check host_id = user.id via RLS, but it's good practice to add it to the query
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('host_id', user.id)
    .eq('status', 'draft'); // Only allow deleting drafts

  if (error) {
    console.error('Error discarding draft:', error);
    throw new Error('Failed to discard draft');
  }

  revalidatePath('/host/listings');
  revalidatePath('/host');
  
  return { success: true };
}

/**
 * Step 1: Update Accommodation Details
 */
export async function updateAccommodation(listingId: string, data: {
  title: string;
  description: string;
  accommodation_type_id: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // Verify ownership implicitly via RLS by doing an update
  const { data: updated, error } = await supabase
    .from('listings')
    .update({
      title: data.title,
      description: data.description,
      accommodation_type_id: data.accommodation_type_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .eq('host_id', user.id)
    .select('id')
    .single();

  if (error || !updated) {
    console.error('Error updating accommodation:', error);
    throw new Error('Failed to save accommodation details');
  }

  // Update progress
  await supabase
    .from('listing_build_progress')
    .update({
      last_step: 'location',
      percent_complete: 20,
      updated_at: new Date().toISOString(),
    })
    .eq('listing_id', listingId);

  revalidatePath(`/host/listings/${listingId}/build/accommodation`);
  redirect(`/host/listings/${listingId}/build/location`);
}

/**
 * Step 2: Update Location Details
 */
export async function updateLocation(listingId: string, data: {
  country: string;
  state: string;
  city: string;
  locality: string;
  postal_code: string;
  address_line1: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // Verify ownership first
  const { data: listing } = await supabase
    .from('listings')
    .select('id')
    .eq('id', listingId)
    .eq('host_id', user.id)
    .single();

  if (!listing) throw new Error('Unauthorized or listing not found');

  // Check if location exists
  const { data: existingLoc } = await supabase
    .from('listing_locations')
    .select('id')
    .eq('listing_id', listingId)
    .single();

  if (existingLoc) {
    const { error } = await supabase
      .from('listing_locations')
      .update({
        country: data.country,
        state: data.state,
        city: data.city,
        locality: data.locality,
        postal_code: data.postal_code,
        address_line1: data.address_line1,
      })
      .eq('id', existingLoc.id);

    if (error) throw new Error('Failed to update location');
  } else {
    const { error } = await supabase
      .from('listing_locations')
      .insert({
        listing_id: listingId,
        country: data.country,
        state: data.state,
        city: data.city,
        locality: data.locality,
        postal_code: data.postal_code,
        address_line1: data.address_line1,
      });

    if (error) throw new Error('Failed to insert location');
  }

  // Update progress
  await supabase
    .from('listing_build_progress')
    .update({
      last_step: 'features',
      percent_complete: 40,
      updated_at: new Date().toISOString(),
    })
    .eq('listing_id', listingId);

  revalidatePath(`/host/listings/${listingId}/build/location`);
  redirect(`/host/listings/${listingId}/build/features`);
}

/**
 * Step 3: Update Features (Occupancy, Furnishing, Amenities)
 */
export async function updateFeatures(listingId: string, data: {
  occupancy_type: 'private' | 'shared' | 'mixed';
  furnishing: 'unfurnished' | 'semi_furnished' | 'fully_furnished';
  gender_preference: 'any' | 'male' | 'female';
  max_occupants: number;
  amenity_ids: string[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // Verify ownership
  const { data: listing } = await supabase
    .from('listings')
    .select('id')
    .eq('id', listingId)
    .eq('host_id', user.id)
    .single();

  if (!listing) throw new Error('Unauthorized or listing not found');

  // Update listing base features
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

  // Update amenities: first delete all existing, then insert new ones
  // In a high-concurrency environment we might do a delta, but for host wizard delete+insert is fine
  await supabase
    .from('listing_amenities')
    .delete()
    .eq('listing_id', listingId);

  if (data.amenity_ids.length > 0) {
    const amenitiesToInsert = data.amenity_ids.map(id => ({
      listing_id: listingId,
      amenity_id: id,
    }));

    const { error: amenitiesError } = await supabase
      .from('listing_amenities')
      .insert(amenitiesToInsert);

    if (amenitiesError) throw new Error('Failed to save amenities');
  }

  // Update progress
  await supabase
    .from('listing_build_progress')
    .update({
      last_step: 'pricing',
      percent_complete: 60,
      updated_at: new Date().toISOString(),
    })
    .eq('listing_id', listingId);

  revalidatePath(`/host/listings/${listingId}/build/features`);
  redirect(`/host/listings/${listingId}/build/pricing`);
}

/**
 * Step 4: Update Pricing
 */
export async function updatePricing(listingId: string, data: {
  amount: number;
  billing_period: 'day' | 'week' | 'month' | 'semester' | 'year';
  security_deposit: number;
  maintenance_fee: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // Verify ownership
  const { data: listing } = await supabase
    .from('listings')
    .select('id')
    .eq('id', listingId)
    .eq('host_id', user.id)
    .single();

  if (!listing) throw new Error('Unauthorized or listing not found');

  // Check existing price
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
        currency: 'INR', // Assuming INR for now
        minimum_duration: 1, // Defaulting to 1 billing period
      })
      .eq('id', existingPrice.id);

    if (error) throw new Error('Failed to update pricing');
  } else {
    const { error } = await supabase
      .from('listing_prices')
      .insert({
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

  // Update progress
  await supabase
    .from('listing_build_progress')
    .update({
      last_step: 'images',
      percent_complete: 80,
      updated_at: new Date().toISOString(),
    })
    .eq('listing_id', listingId);

  revalidatePath(`/host/listings/${listingId}/build/pricing`);
  redirect(`/host/listings/${listingId}/build/images`);
}

/**
 * Step 6: Publish Listing
 */
export async function publishListing(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // Strict Validation before publishing
  const { data: listing } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      description,
      accommodation_type_id,
      max_occupants,
      listing_locations(id),
      listing_prices(id),
      listing_images(id)
    `)
    .eq('id', listingId)
    .eq('host_id', user.id)
    .single();

  if (!listing) throw new Error('Unauthorized or listing not found');

  const errors: string[] = [];

  if (!listing.title || listing.title.length < 10) errors.push('Title is missing or too short.');
  if (!listing.description || listing.description.length < 20) errors.push('Description is missing or too short.');
  if (!listing.accommodation_type_id) errors.push('Accommodation type is required.');
  if (!listing.listing_locations || listing.listing_locations.length === 0) errors.push('Location is missing.');
  if (!listing.listing_prices || listing.listing_prices.length === 0) errors.push('Pricing is missing.');
  if (!listing.listing_images || listing.listing_images.length === 0) errors.push('At least one image is required.');

  if (errors.length > 0) {
    throw new Error('Validation failed: ' + errors.join(' '));
  }

  // Update status to ready (which means ready to be published, or published if we want instant publish)
  // According to our plan: Ready -> Pending Review / Published
  // For V1, we'll auto-publish by setting status to 'published' so it shows up in search instantly
  const { error } = await supabase
    .from('listings')
    .update({
      status: 'published',
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId);

  if (error) throw new Error('Failed to publish listing');

  // Mark wizard as 100% complete
  await supabase
    .from('listing_build_progress')
    .update({
      percent_complete: 100,
      updated_at: new Date().toISOString(),
    })
    .eq('listing_id', listingId);

  revalidatePath('/s'); // Revalidate search page
  revalidatePath('/host/listings');
  revalidatePath(`/host/listings/${listingId}`);
  
  redirect('/host/listings');
}
