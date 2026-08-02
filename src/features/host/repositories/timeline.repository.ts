import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import {
  TimelineStay,
  TimelineBooking,
  TimelineAvailability,
} from '../view-models/timeline.viewmodel';

export class TimelineRepository {
  static async getStays(
    supabase: SupabaseClient<Database>,
    listingIds: string[]
  ): Promise<TimelineStay[]> {
    if (listingIds.length === 0) return [];
    const { data, error } = await supabase
      .from('stays')
      .select(
        `
        id, 
        listing_id, 
        expected_move_in_date, 
        expected_move_out_date, 
        status,
        guest_profiles!stays_guest_id_fkey(full_name)
      `
      )
      .in('listing_id', listingIds)
      .in('status', ['upcoming', 'active'])
      .gte('expected_move_out_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;
    return (data as unknown as TimelineStay[]) || [];
  }

  static async getBookings(
    supabase: SupabaseClient<Database>,
    listingIds: string[]
  ): Promise<TimelineBooking[]> {
    if (listingIds.length === 0) return [];
    const { data, error } = await supabase
      .from('bookings')
      .select(
        `
        id, 
        listing_id, 
        requested_move_in, 
        requested_duration, 
        status,
        guest_profiles!bookings_guest_id_fkey(full_name)
      `
      )
      .in('listing_id', listingIds)
      .eq('status', 'pending');

    if (error) throw error;
    return (data as unknown as TimelineBooking[]) || [];
  }

  static async getAvailabilityBlocks(
    supabase: SupabaseClient<Database>,
    listingIds: string[]
  ): Promise<TimelineAvailability[]> {
    if (listingIds.length === 0) return [];
    const { data, error } = await supabase
      .from('listing_availability')
      .select('id, listing_id, start_date, end_date, status, source')
      .in('listing_id', listingIds)
      .gte('end_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;
    return (data as unknown as TimelineAvailability[]) || [];
  }
}
