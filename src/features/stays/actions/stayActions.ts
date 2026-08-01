'use server';

import { revalidatePath } from 'next/cache';
import { createNotification } from '@/features/notifications/actions/notification-actions';
import { NotificationType } from '@/features/notifications/types';
import { safeAction } from '@/lib/safeAction';
import { transitionStay } from '../services/stay-state-machine';

// ------------------------------------------------------------------
// PUBLIC ACTIONS
// ------------------------------------------------------------------

export async function checkInStay(stayId: string) {
  return safeAction(async (user, supabase) => {
    // Verify authorization (Guest checking in, or Host checking them in)
    const { data: stay } = await supabase
      .from('stays')
      .select('guest_id, listings(title, host_id)')
      .eq('id', stayId)
      .single();

    if (!stay) return { error: 'Unauthorized.' };
    const listings = stay.listings as unknown as {
      title: string;
      host_id: string;
    };
    if (stay.guest_id !== user.id && listings.host_id !== user.id) {
      return { error: 'Unauthorized.' };
    }

    const res = await transitionStay(stayId, 'active', user.id, supabase, {
      actual_move_in_date: new Date().toISOString().split('T')[0],
    });

    if (res.success) {
      // Notify the host that the guest checked in
      if (user.id === stay.guest_id) {
        await createNotification({
          userId: listings.host_id,
          type: NotificationType.STAY_CHECKED_IN,
          title: 'Guest Checked In',
          message: `Your guest has checked into ${listings.title}.`,
          link: '/host/stays',
        });
      }
    }

    revalidatePath('/users');
    revalidatePath('/host/stays');
    return { success: true };
  });
}

export async function checkOutStay(stayId: string) {
  return safeAction(async (user, supabase) => {
    // Verify authorization
    const { data: stay } = await supabase
      .from('stays')
      .select('guest_id, listings(title, host_id)')
      .eq('id', stayId)
      .single();

    if (!stay) return { error: 'Unauthorized.' };
    const listings = stay.listings as unknown as {
      title: string;
      host_id: string;
    };
    if (stay.guest_id !== user.id && listings.host_id !== user.id) {
      return { error: 'Unauthorized.' };
    }

    const res = await transitionStay(stayId, 'checked_out', user.id, supabase, {
      actual_move_out_date: new Date().toISOString().split('T')[0],
    });

    if (res.success) {
      // Notify host if guest checked out
      if (user.id === stay.guest_id) {
        await createNotification({
          userId: listings.host_id,
          type: NotificationType.STAY_CHECKED_OUT,
          title: 'Guest Checked Out',
          message: `Your guest has checked out of ${listings.title}.`,
          link: '/host/stays',
        });
      }
    }

    revalidatePath('/users');
    revalidatePath('/host/stays');
    return { success: true };
  });
}

export async function completeStay(stayId: string) {
  return safeAction(async (user, supabase) => {
    // Verify authorization (Host completes the stay after checkout/inspection)
    const { data: stay } = await supabase
      .from('stays')
      .select('guest_id, listings(title, host_id)')
      .eq('id', stayId)
      .single();

    if (!stay) return { error: 'Unauthorized.' };
    const listings = stay.listings as unknown as {
      title: string;
      host_id: string;
    };
    if (listings.host_id !== user.id) {
      return { error: 'Unauthorized.' };
    }

    const res = await transitionStay(stayId, 'completed', user.id, supabase);

    if (res.success) {
      // Remind guest to leave a review
      await createNotification({
        userId: stay.guest_id,
        type: NotificationType.REVIEW_REMINDER,
        title: 'Leave a Review',
        message: `Your stay at ${listings.title} is complete. Please leave a review!`,
        link: '/users',
      });
    }

    revalidatePath('/host/stays');
    return { success: true };
  });
}
