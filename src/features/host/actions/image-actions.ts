'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Uploads an image for a listing.
 * Enforces a maximum of 5 images.
 */
export async function addListingImage(listingId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // Verify ownership
  const { data: listing } = await supabase
    .from('listings')
    .select('id')
    .eq('id', listingId)
    .eq('host_id', user.id)
    .single();

  if (!listing) throw new Error('Unauthorized or listing not found');

  const file = formData.get('image') as File;
  if (!file) throw new Error('No image provided');

  // Check current image count
  const { count } = await supabase
    .from('listing_images')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId);

  if ((count || 0) >= 5) {
    throw new Error('Maximum of 5 images allowed');
  }

  // Upload to storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${listingId}/${fileName}`; // We don't include user.id to keep urls simple, but we enforce RLS on DB

  const { error: uploadError } = await supabase.storage
    .from('listings')
    .upload(filePath, file);

  if (uploadError) throw new Error('Failed to upload image');

  // Insert into database
  const { error: dbError } = await supabase.from('listing_images').insert({
    listing_id: listingId,
    storage_path: filePath,
    display_order: (count || 0) + 1,
  });

  if (dbError) {
    // Attempt to clean up storage if DB insert fails
    await supabase.storage.from('listings').remove([filePath]);
    throw new Error('Failed to save image record');
  }

  revalidatePath(`/host/listings/${listingId}/build/images`);
  return { success: true };
}

export async function removeListingImage(
  listingId: string,
  imageId: string,
  storagePath: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // We explicitly check host_id via listing join
  const { data: img } = await supabase
    .from('listing_images')
    .select('id, listings!inner(host_id)')
    .eq('id', imageId)
    .eq('listing_id', listingId)
    .eq('listings.host_id', user.id)
    .single();

  if (!img) throw new Error('Unauthorized or image not found');

  // 1. Delete from DB
  const { error: dbError } = await supabase
    .from('listing_images')
    .delete()
    .eq('id', imageId);

  if (dbError) throw new Error('Failed to remove image record');

  // 2. Delete from storage
  await supabase.storage.from('listings').remove([storagePath]);

  revalidatePath(`/host/listings/${listingId}/build/images`);
  return { success: true };
}
