'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { createNotification } from '@/features/notifications/actions/createNotification';
import { safeAction } from '@/lib/safeAction';

type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['approved', 'rejected', 'cancelled', 'expired'],
  approved: ['cancelled'], // Can be cancelled before stay begins
  rejected: [],
  cancelled: [],
  expired: [],
};

async function logBookingEvent(
  supabase: any,
  bookingId: string,
  eventType: string,
  actorId: string,
  metadata: any = {}
) {
  const { error } = await supabase.from('booking_events').insert({
    booking_id: bookingId,
    event_type: eventType,
    actor_id: actorId,
    metadata,
  });
  if (error) {
    console.error(`Failed to log booking event ${eventType}:`, error);
  }
}

async function transitionBooking(
  bookingId: string,
  currentRequiredStatus: BookingStatus,
  newStatus: BookingStatus,
  actorId: string,
  supabase: any,
  metadata: any = {}
) {
  // 1. Fetch current booking state
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*, listings(title, host_id)')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    return { error: 'Booking not found.' };
  }

  const currentStatus = booking.status as BookingStatus;

  // 2. Validate transition
  if (!VALID_TRANSITIONS[currentStatus].includes(newStatus)) {
    return { error: `Invalid transition from ${currentStatus} to ${newStatus}.` };
  }

  // 3. Update status
  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)
    .eq('status', currentStatus) 
    .select()
    .single();

  if (updateError || !updatedBooking) {
    return { error: 'Booking state changed by another process. Please refresh.' };
  }

  // 4. Log event
  await logBookingEvent(supabase, bookingId, newStatus, actorId, {
    previous_status: currentStatus,
    new_status: newStatus,
    ...metadata,
  });

  return { success: true, booking: { ...updatedBooking, listings: booking.listings } };
}

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
    await supabase.from('booking_events').insert({
      booking_id: newBooking.id,
      actor_id: user.id,
      event_type: 'request_created',
      metadata: {
        snapshot_monthly_rent: listing.monthly_price,
        snapshot_security_deposit: listing.security_deposit,
        total_amount: totalAmount,
        months: params.months
      }
    });

    // 5. Notify host
    await createNotification({
      userId: listing.host_id,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `You have a new request for ${listing.title}.`,
      link: '/host/stays'
    });

    revalidatePath(`/listings/${listing.public_id}`);
    revalidatePath('/profile/trips');
    
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
    await createNotification({
      userId: booking.guest_id,
      type: 'booking_approved',
      title: 'Booking Approved!',
      message: `Your booking request for ${booking.listings.title} was approved.`,
      link: '/profile/trips'
    });

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
    await createNotification({
      userId: booking.guest_id,
      type: 'booking_rejected',
      title: 'Booking Declined',
      message: `Your booking request for ${booking.listings.title} was declined.`,
      link: '/profile/trips'
    });

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
      await createNotification({
        userId: (booking.listings as any).host_id,
        type: 'booking_approved',
        title: 'Booking Cancelled',
        message: `A booking request for ${(booking.listings as any).title} was cancelled by the guest.`,
        link: '/host/bookings'
      });
    }
  }

  revalidatePath('/host/bookings');
  revalidatePath('/profile/trips');
  return res;
}
