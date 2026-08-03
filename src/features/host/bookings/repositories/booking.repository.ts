/*
==================================================
Domain: Host Booking Operations - Persistence Repository
Purpose: Pure database access layer for bookings. Fetches enriched rows and invokes atomic RPC state transitions.
==================================================
*/

import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import {
  type EnrichedBookingRow,
  type DatabaseBookingStatus,
} from '../types/booking.types';

export class BookingRepository {
  /**
   * Retrieves all bookings for listings owned by the given host ID.
   * Returns pure EnrichedBookingRow records, never presentation ViewModels.
   */
  public static async getHostBookings(
    supabase: SupabaseClient<Database>,
    hostId: string
  ): Promise<EnrichedBookingRow[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(
        `
        *,
        listing:listings!inner(title, city, slug, host_id),
        guest:profiles(full_name, display_name, avatar_storage_path)
      `
      )
      .eq('listing.host_id', hostId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        '[BookingRepository.getHostBookings] Error:',
        error.message
      );
      return [];
    }

    if (!data) return [];

    return (data as unknown as Record<string, unknown>[]).map((item) => {
      const listing = (item.listing || {}) as Record<string, unknown>;
      const guest = (item.guest || {}) as Record<string, unknown>;
      const guestName = (guest.full_name ||
        guest.display_name ||
        'Guest Resident') as string;

      return {
        id: String(item.id || ''),
        listing_id: String(item.listing_id || ''),
        guest_id: String(item.guest_id || ''),
        requested_move_in: String(item.requested_move_in || ''),
        requested_duration: Number(item.requested_duration || 1),
        message: item.message ? String(item.message) : null,
        snapshot_monthly_rent: Number(item.snapshot_monthly_rent || 0),
        snapshot_security_deposit: Number(item.snapshot_security_deposit || 0),
        snapshot_maintenance_fee: Number(item.snapshot_maintenance_fee || 0),
        snapshot_billing_period: String(
          item.snapshot_billing_period || 'monthly'
        ),
        snapshot_minimum_stay: Number(item.snapshot_minimum_stay || 1),
        expires_at: item.expires_at ? String(item.expires_at) : null,
        status: (item.status || 'pending') as DatabaseBookingStatus,
        created_at: String(item.created_at || ''),
        updated_at: String(item.updated_at || ''),
        guest_name: guestName,
        guest_avatar: guest.avatar_storage_path
          ? String(guest.avatar_storage_path)
          : null,
        listing_title: String(listing.title || 'Accommodations Listing'),
        listing_city: listing.city ? String(listing.city) : undefined,
        listing_slug: listing.slug ? String(listing.slug) : undefined,
      };
    });
  }

  /**
   * Invokes the atomic transition_booking database RPC to change booking state with built-in concurrency locks and audit logging.
   */
  public static async transitionBooking(
    supabase: SupabaseClient<Database>,
    bookingId: string,
    currentStatus: DatabaseBookingStatus,
    newStatus: DatabaseBookingStatus,
    actorId: string,
    metadata: Record<string, unknown> = {}
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.rpc('transition_booking', {
      p_booking_id: bookingId,
      p_current_status: currentStatus,
      p_new_status: newStatus,
      p_actor_id: actorId,
      p_metadata: metadata as unknown as undefined,
    });

    if (error) {
      console.error(
        '[BookingRepository.transitionBooking] RPC error:',
        error.message
      );
      return { success: false, error: error.message };
    }

    return { success: true };
  }
}
