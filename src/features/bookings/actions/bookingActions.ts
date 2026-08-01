'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import * as NotificationService from '@/features/notifications/actions/notification-actions';
import { safeAction } from '@/lib/safeAction';

import { transitionBooking, logBookingEvent } from '../services/booking-state-machine';

// ------------------------------------------------------------------
// PUBLIC ACTIONS
// ------------------------------------------------------------------

export async function requestBooking(params: {
  listingId: string;
  startDate: string;
  endDate: string;
  months: number;
}) {
  return safeAction(async (user, supabase) => {
    // 1. Fetch listing details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('title, host_id, monthly_price, security_deposit, public_id')
      .eq('id', params.listingId)
      .single();

    if (listingError || !listing) return { error: 'Listing not found.' };

    const totalRent = listing.monthly_price * params.months;
    const platformFee = totalRent * 0.05;
    const totalAmount = totalRent + (listing.security_deposit || 0) + platformFee;

    // 2. Optimistic availability check
    const { data: conflicts } = await supabase
      .from('listing_availability')
      .select('id')
      .eq('listing_id', params.listingId)
      .lte('start_date', params.endDate)
      .gte('end_date', params.startDate)
      .limit(1);

    if (conflicts && conflicts.length > 0) {
      return { error: 'These dates are no longer available.' };
    }

    // 3. Create booking request
    const { data: newBooking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        listing_id: params.listingId,
        guest_id: user.id,
        requested_move_in: params.startDate,
        status: 'pending',
        snapshot_monthly_rent: listing.monthly_price,
        snapshot_security_deposit: listing.security_deposit,
      })
      .select()
      .single();

    if (insertError) {
      return { error: 'Failed to request booking.' };
    }

    // 4. Create timeline event
    await logBookingEvent(supabase, newBooking.id, 'request_created', user.id, {
      snapshot_monthly_rent: listing.monthly_price,
      snapshot_security_deposit: listing.security_deposit,
      total_amount: totalAmount,
      months: params.months
    });

    // 5. Notify host
    await NotificationService.notifyBookingRequest(
      listing.host_id,
      listing.title
    );

    revalidatePath(`/listings/${listing.public_id}`);
    revalidatePath('/users');
    
    return { bookingId: newBooking.id };
  });
}

export async function approveBooking(bookingId: string) {
  return safeAction(async (user, supabase) => {
    // 1. Authorize: Only host can approve
    const { data: authCheck } = await supabase
      .from('bookings')
      .select('listings(host_id)')
      .eq('id', bookingId)
      .single();

    if (!authCheck || (authCheck.listings as any).host_id !== user.id) {
      return { error: 'Unauthorized to approve this booking.' };
    }

    const res = await transitionBooking(bookingId, 'pending', 'approved', user.id, supabase);
    if (!res.success) return res;

    const booking = res.booking;

    // 2. Notify guest
    await NotificationService.notifyBookingApproved(
      booking.guest_id,
      booking.listings.title
    );

    revalidatePath('/host/stays');
    return { success: true };
  });
}

export async function rejectBooking(bookingId: string) {
  return safeAction(async (user, supabase) => {
    // 1. Authorize: Only host can reject
    const { data: authCheck } = await supabase
      .from('bookings')
      .select('listings(host_id)')
      .eq('id', bookingId)
      .single();

    if (!authCheck || (authCheck.listings as any).host_id !== user.id) {
      return { error: 'Unauthorized to reject this booking.' };
    }

    const res = await transitionBooking(bookingId, 'pending', 'rejected', user.id, supabase);
    if (!res.success) return res;

    const booking = res.booking;

    // 2. Notify guest
    await NotificationService.notifyBookingRejected(
      booking.guest_id,
      booking.listings.title
    );

    revalidatePath('/host/stays');
    return { success: true };
  });
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized.' };

  const { data: booking } = await supabase
    .from('bookings')
    .select('guest_id, listings(title, host_id)')
    .eq('id', bookingId)
    .single();

  if (!booking || (booking.guest_id !== user.id && (booking.listings as any).host_id !== user.id)) {
    return { error: 'Unauthorized.' };
  }

  const res = await transitionBooking(bookingId, 'pending', 'cancelled', user.id, supabase);

  if (res.success) {
    if (user.id === booking.guest_id) {
      await NotificationService.notifyBookingCancelled(
        (booking.listings as any).host_id,
        (booking.listings as any).title
      );
    }
  }

  revalidatePath('/host/bookings');
  revalidatePath('/users');
  return res;
}
