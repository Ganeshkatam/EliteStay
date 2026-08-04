'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { HostAccessService } from '@/features/hosting/services/host-access.service';

/**
 * Creates a new Draft listing and redirects to the publishing workspace.
 */
export async function createDraftListing() {
  const { user, supabase } =
    await HostAccessService.requireHostCapabilityForAction();

  // Create the base listing row
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

  revalidatePath('/host/listings');
  revalidatePath('/host');

  redirect(`/host/listings/${listing.id}/build`);
}

/**
 * Discards an abandoned draft.
 */
export async function discardDraftListing(listingId: string) {
  const { user, supabase } =
    await HostAccessService.requireHostCapabilityForAction();

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('host_id', user.id)
    .eq('status', 'draft');

  if (error) {
    console.error('Error discarding draft:', error);
    throw new Error('Failed to discard draft');
  }

  revalidatePath('/host/listings');
  revalidatePath('/host');

  return { success: true };
}
