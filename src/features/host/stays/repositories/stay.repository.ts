/*
==================================================
Domain: Host Stay & Resident Operations - Repository Layer
Purpose: Handles pure persistence access and RPC execution for residential stays without UI presentation ViewModels.
==================================================
*/

import {
  type EnrichedStayRow,
  type DatabaseStayStatus,
} from '../types/stay.types';
import { type SupabaseClient } from '@supabase/supabase-js';

export class StayRepository {
  /**
   * Retrieves enriched persistence stay rows for a designated host per Repository Rule.
   * Does not evaluate operational queues or create ViewModels.
   */
  public static async getHostStays(
    supabase: SupabaseClient,
    hostId: string
  ): Promise<EnrichedStayRow[]> {
    const { data, error } = await supabase
      .from('stays')
      .select(
        `
        *,
        listing:listings!inner(title, city, slug, host_id),
        guest:profiles(full_name, display_name, avatar_storage_path)
      `
      )
      .eq('listing.host_id', hostId)
      .order('expected_move_in_date', { ascending: true });

    if (error) {
      console.error(
        '[StayRepository.getHostStays] Error fetching stays:',
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
        'Resident Tenant') as string;

      return {
        id: String(item.id || ''),
        listing_id: String(item.listing_id || ''),
        guest_id: String(item.guest_id || ''),
        created_from_booking_id: item.created_from_booking_id
          ? String(item.created_from_booking_id)
          : null,
        expected_move_in_date: String(item.expected_move_in_date || ''),
        actual_move_in_date: item.actual_move_in_date
          ? String(item.actual_move_in_date)
          : null,
        expected_move_out_date: String(item.expected_move_out_date || ''),
        actual_move_out_date: item.actual_move_out_date
          ? String(item.actual_move_out_date)
          : null,
        agreed_amount: Number(item.agreed_amount || 0),
        agreed_billing_period: String(item.agreed_billing_period || 'monthly'),
        security_deposit_paid: Number(item.security_deposit_paid || 0),
        status: (item.status || 'upcoming') as DatabaseStayStatus,
        created_at: String(item.created_at || ''),
        updated_at: String(item.updated_at || ''),
        guest_name: guestName,
        guest_avatar: guest.avatar_storage_path
          ? String(guest.avatar_storage_path)
          : null,
        guest_email: item.guest_email ? String(item.guest_email) : undefined,
        guest_phone: item.guest_phone ? String(item.guest_phone) : undefined,
        listing_title: String(listing.title || 'Property Accommodations'),
        listing_city: listing.city ? String(listing.city) : undefined,
        listing_slug: listing.slug ? String(listing.slug) : undefined,
      };
    });
  }

  /**
   * Invokes the atomic transition_stay RPC to safely alter tenancy status in PostgreSQL.
   */
  public static async transitionStay(
    supabase: SupabaseClient,
    stayId: string,
    currentStatus: DatabaseStayStatus,
    newStatus: DatabaseStayStatus,
    actorId: string,
    updates: Record<string, unknown> = {},
    metadata: Record<string, unknown> = {}
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.rpc('transition_stay', {
      p_stay_id: stayId,
      p_current_status: currentStatus,
      p_new_status: newStatus,
      p_actor_id: actorId,
      p_updates: updates,
      p_metadata: metadata,
    });

    if (error) {
      console.error(
        '[StayRepository.transitionStay] RPC failure:',
        error.message
      );
      return { success: false, error: error.message };
    }

    return { success: true };
  }
}
