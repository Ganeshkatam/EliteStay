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
        updated_at,
        city, 
        locality,
        accommodation_type:accommodation_types(name),
        images:listing_images(storage_path),
        prices:listing_prices(amount, billing_period)
      `
      )
      .eq('host_id', hostId)
      .order('updated_at', { ascending: false });

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
