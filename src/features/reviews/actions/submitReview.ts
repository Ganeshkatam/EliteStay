'use server';

import { revalidatePath } from 'next/cache';
import { createNotification } from '@/features/notifications/actions/notification-actions';
import { NotificationType } from '@/features/notifications/types';
import { safeAction } from '@/lib/safeAction';

export async function submitReview(params: {
  stayId: string;
  listingId: string;
  rating: number;
  title: string;
  body: string;
}) {
  return safeAction(async (user, supabase) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        stay_id: params.stayId,
        listing_id: params.listingId,
        guest_id: user.id,
        rating: params.rating,
        title: params.title,
        body: params.body,
      })
      .select('*, listings(host_id, title)')
      .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: 'You have already reviewed this stay.' };
    }
    if (error.code === '42501') { // RLS violation
      return { error: 'You can only review completed stays.' };
    }
    console.error('Failed to submit review:', error);
    return { error: 'Failed to submit review.' };
  }

    // Notify host
    await createNotification({
      userId: (data.listings as any).host_id,
      type: NotificationType.REVIEW_RECEIVED,
      title: 'New Review',
      message: `You received a new review for ${(data.listings as any).title}.`,
      link: '/host/reviews'
    });

    revalidatePath('/users');
    revalidatePath(`/stay/${data.listing_id}`);
    
    return { success: true };
  });
}

export async function submitHostResponse(reviewId: string, response: string) {
  return safeAction(async (user, supabase) => {
    const { data, error } = await supabase
      .from('reviews')
      .update({ host_response: response })
      .eq('id', reviewId)
      .select('guest_id, listings(title)')
      .single();

  if (error) {
    return { error: 'Failed to submit response.' };
  }

    // Notify guest
    await createNotification({
      userId: data.guest_id,
      type: NotificationType.HOST_RESPONSE,
      title: 'Host Responded to Your Review',
      message: `The host of ${(data.listings as any).title} responded to your review.`,
      link: '/users'
    });

    revalidatePath('/users');
    return { success: true };
  });
}
