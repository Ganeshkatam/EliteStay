'use server';

import { BookingIntent } from '../types/booking.types';
import { BookingOrchestrator } from '../services/booking-orchestrator';
import { createStaticClient } from '@/lib/supabase/server';

export async function processBookingIntent(intent: BookingIntent) {
  const supabase = createStaticClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user) {
    return {
      success: false,
      error: 'Unauthorized: Please log in to book a property.',
    };
  }

  try {
    const result = await BookingOrchestrator.processIntent(
      session.user.id,
      intent
    );
    const type =
      'leaseDurationMonths' in result && !('status' in result)
        ? 'UNKNOWN'
        : 'paymentIntentId' in result
          ? 'RESERVATION'
          : 'APPLICATION';
    return { success: true, id: result.id, type };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Booking failed. Please try again.',
    };
  }
}
