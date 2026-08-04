'use server';

/*
==================================================
Domain: Host Booking Operations - Domain Server Actions
Purpose: Thin orchestration actions delegating execution to BookingOperationsService and invalidating cached view paths.
==================================================
*/

import { revalidatePath } from 'next/cache';
import { BookingOperationsService } from '../services/booking-operations.service';
import { HostAccessService } from '@/features/hosting/services/host-access.service';

export async function approveBookingAction(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  const { user, supabase } =
    await HostAccessService.requireHostCapabilityForAction();

  const result = await BookingOperationsService.approveBooking(
    supabase,
    bookingId,
    user.id
  );

  if (result.success) {
    revalidatePath('/host/bookings');
    revalidatePath('/host');
  }

  return result;
}

export async function rejectBookingAction(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  const { user, supabase } =
    await HostAccessService.requireHostCapabilityForAction();

  const result = await BookingOperationsService.rejectBooking(
    supabase,
    bookingId,
    user.id
  );

  if (result.success) {
    revalidatePath('/host/bookings');
    revalidatePath('/host');
  }

  return result;
}

/**
 * Generic dispatcher for dynamic BookingAction button execution.
 */
export async function executeBookingAction(
  bookingId: string,
  actionId: string
): Promise<{ success: boolean; error?: string }> {
  switch (actionId) {
    case 'approve':
      return approveBookingAction(bookingId);
    case 'reject':
      return rejectBookingAction(bookingId);
    case 'reschedule':
    case 'convert-to-stay':
      return {
        success: false,
        error: `Action "${actionId}" is scheduled for upcoming feature enablement.`,
      };
    default:
      return {
        success: false,
        error: `Unknown action identifier: ${actionId}`,
      };
  }
}
