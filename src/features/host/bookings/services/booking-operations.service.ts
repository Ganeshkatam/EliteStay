/*
==================================================
Domain: Host Booking Operations - Service Layer
Purpose: Thin orchestration service that bridges repositories, domain policies, and ViewModel composition factories.
==================================================
*/

import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import { type OperationalQueueType } from '../types/booking.types';
import { BookingRepository } from '../repositories/booking.repository';
import { BookingDecisionPolicy } from '../policies/BookingDecisionPolicy';
import {
  type BookingWorkspaceViewModel,
  createBookingWorkspaceViewModel,
} from '../view-models/booking-workspace.viewmodel';

export class BookingOperationsService {
  /**
   * Retrieves host bookings from persistence and composes the master workspace ViewModel,
   * satisfying the Operational Workspace Rule.
   */
  public static async getWorkspaceViewModel(
    supabase: SupabaseClient<Database>,
    hostId: string,
    activeQueue: OperationalQueueType = 'needs-attention',
    referenceDate: Date = new Date()
  ): Promise<BookingWorkspaceViewModel> {
    const rows = await BookingRepository.getHostBookings(supabase, hostId);
    return createBookingWorkspaceViewModel(rows, activeQueue, referenceDate);
  }

  /**
   * Orchestrates booking request approval after validating domain rules via BookingDecisionPolicy.
   */
  public static async approveBooking(
    supabase: SupabaseClient<Database>,
    bookingId: string,
    hostId: string
  ): Promise<{ success: boolean; error?: string }> {
    // 1. Fetch current rows to find target booking and verify ownership/state
    const rows = await BookingRepository.getHostBookings(supabase, hostId);
    const target = rows.find((r) => r.id === bookingId);

    if (!target) {
      return {
        success: false,
        error: 'Booking not found or access unauthorized.',
      };
    }

    // 2. Evaluate decision business policy
    const check = BookingDecisionPolicy.validateApproval(target);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    // 3. Invoke atomic transition RPC via repository
    return BookingRepository.transitionBooking(
      supabase,
      bookingId,
      'pending',
      'approved',
      hostId,
      {
        action: 'host_approval',
        approved_at: new Date().toISOString(),
      }
    );
  }

  /**
   * Orchestrates declining/rejecting a pending booking request after validation.
   */
  public static async rejectBooking(
    supabase: SupabaseClient<Database>,
    bookingId: string,
    hostId: string
  ): Promise<{ success: boolean; error?: string }> {
    const rows = await BookingRepository.getHostBookings(supabase, hostId);
    const target = rows.find((r) => r.id === bookingId);

    if (!target) {
      return {
        success: false,
        error: 'Booking not found or access unauthorized.',
      };
    }

    const check = BookingDecisionPolicy.validateRejection(target);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    return BookingRepository.transitionBooking(
      supabase,
      bookingId,
      'pending',
      'rejected',
      hostId,
      {
        action: 'host_rejection',
        rejected_at: new Date().toISOString(),
      }
    );
  }
}
