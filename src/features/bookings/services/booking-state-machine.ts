import { SupabaseClient } from '@supabase/supabase-js';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['approved', 'rejected', 'cancelled', 'expired'],
  approved: ['cancelled'], // Can be cancelled before stay begins
  rejected: [],
  cancelled: [],
  expired: [],
};

export async function logBookingEvent(
  supabase: SupabaseClient,
  bookingId: string,
  action: string,
  actorId: string,
  metadata: any = {}
) {
  const { error } = await supabase.from('booking_events').insert({
    booking_id: bookingId,
    action,
    actor_id: actorId,
    metadata,
  });
  if (error) {
    console.error(`Failed to log booking event ${action}:`, error);
  }
}

export async function transitionBooking(
  bookingId: string,
  currentRequiredStatus: BookingStatus,
  newStatus: BookingStatus,
  actorId: string,
  supabase: SupabaseClient,
  metadata: any = {}
) {
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*, listings(title, host_id)')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    return { error: 'Booking not found.' };
  }

  const currentStatus = booking.status as BookingStatus;

  if (!VALID_TRANSITIONS[currentStatus].includes(newStatus)) {
    return { error: `Invalid transition from ${currentStatus} to ${newStatus}.` };
  }

  const { data: updatedBooking, error: updateError } = await supabase.rpc('transition_booking', {
    p_booking_id: bookingId,
    p_current_status: currentStatus,
    p_new_status: newStatus,
    p_actor_id: actorId,
    p_metadata: metadata
  });

  if (updateError || !updatedBooking || !updatedBooking.success) {
    console.error('RPC transition_booking failed:', updateError);
    return { error: 'Booking state changed by another process. Please refresh.' };
  }

  return { success: true, booking: { ...booking, status: newStatus, listings: booking.listings } };
}
