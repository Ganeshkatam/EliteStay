import { revalidatePath } from 'next/cache';
import { createNotification } from '@/features/notifications/actions/createNotification';
import { safeAction } from '@/lib/safeAction';
import { SupabaseClient } from '@supabase/supabase-js';

type StayStatus = 'upcoming' | 'active' | 'extended' | 'checked_out' | 'completed' | 'terminated';

const VALID_STAY_TRANSITIONS: Record<StayStatus, StayStatus[]> = {
  upcoming: ['active', 'terminated'],
  active: ['checked_out', 'extended', 'terminated'],
  extended: ['checked_out', 'terminated'],
  checked_out: ['completed'],
  completed: [],
  terminated: [],
};

async function transitionStay(
  stayId: string,
  newStatus: StayStatus,
  actorId: string,
  supabase: SupabaseClient,
  updates: Record<string, unknown> = {}
) {
  const { data: stay, error: fetchError } = await supabase
    .from('stays')
    .select('status')
    .eq('id', stayId)
    .single();

  if (fetchError || !stay) {
    return { error: 'Stay not found.' };
  }

  const currentStatus = stay.status as StayStatus;

  if (!VALID_STAY_TRANSITIONS[currentStatus].includes(newStatus)) {
    return { error: `Invalid transition from ${currentStatus} to ${newStatus}.` };
  }

  const { data: updatedStay, error: updateError } = await supabase
    .from('stays')
    .update({ status: newStatus, ...updates })
    .eq('id', stayId)
    .eq('status', currentStatus)
    .select()
    .single();

  if (updateError || !updatedStay) {
    return { error: 'Stay state changed by another process. Please refresh.' };
  }

  return { success: true, stay: updatedStay };
}

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

    if (!stay || (stay.guest_id !== user.id && (stay.listings as any).host_id !== user.id)) {
      return { error: 'Unauthorized.' };
    }

    const res = await transitionStay(stayId, 'active', user.id, supabase, {
      actual_move_in_date: new Date().toISOString().split('T')[0]
    });

    if (res.success) {
      // Notify the host that the guest checked in
      if (user.id === stay.guest_id) {
        await createNotification({
          userId: (stay.listings as any).host_id,
          type: 'stay_checked_in',
          title: 'Guest Checked In',
          message: `Your guest has checked into ${(stay.listings as any).title}.`,
          link: '/host/stays'
        });
      }
    }

    revalidatePath('/profile/trips');
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

    if (!stay || (stay.guest_id !== user.id && (stay.listings as any).host_id !== user.id)) {
      return { error: 'Unauthorized.' };
    }

    const res = await transitionStay(stayId, 'checked_out', user.id, supabase, {
      actual_move_out_date: new Date().toISOString().split('T')[0]
    });

    if (res.success) {
      // Notify host if guest checked out
      if (user.id === stay.guest_id) {
        await createNotification({
          userId: (stay.listings as any).host_id,
          type: 'stay_checked_out',
          title: 'Guest Checked Out',
          message: `Your guest has checked out of ${(stay.listings as any).title}.`,
          link: '/host/stays'
        });
      }
    }

    revalidatePath('/profile/trips');
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

    if (!stay || (stay.listings as any).host_id !== user.id) {
      return { error: 'Unauthorized.' };
    }

    const res = await transitionStay(stayId, 'completed', user.id, supabase);
    
    if (res.success) {
      // Remind guest to leave a review
      await createNotification({
        userId: stay.guest_id,
        type: 'review_reminder',
        title: 'Leave a Review',
        message: `Your stay at ${(stay.listings as any).title} is complete. Please leave a review!`,
        link: '/profile/trips'
      });
    }

    revalidatePath('/host/stays');
    return { success: true };
  });
}
