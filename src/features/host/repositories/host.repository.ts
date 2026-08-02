import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export type ListingStatus = Database['public']['Enums']['listing_status'];

export class HostRepository {
  static async getListings(supabase: SupabaseClient<Database>, hostId: string) {
    const { data, error } = await supabase
      .from('listings')
      .select(
        `
        id, 
        public_id,
        status, 
        title, 
        description,
        city, 
        locality,
        images:listing_images(storage_path),
        prices:listing_prices(amount, billing_period),
        listing_build_progress(percent_complete, last_step)
      `
      )
      .eq('host_id', hostId);

    if (error) throw error;
    return data || [];
  }

  static async updateListingStatus(
    supabase: SupabaseClient<Database>,
    listingId: string,
    status: ListingStatus
  ) {
    const { data, error } = await supabase
      .from('listings')
      .update({
        status,
      } as unknown as Database['public']['Tables']['listings']['Update'])
      .eq('id', listingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
