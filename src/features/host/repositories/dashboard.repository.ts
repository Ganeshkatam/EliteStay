import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export class DashboardRepository {
  static async getPendingBookingsCount(
    supabase: SupabaseClient<Database>,
    hostId: string
  ): Promise<number> {
    const { count, error } = await supabase
      .from('bookings')
      .select('id, listings!inner(host_id)', { count: 'exact', head: true })
      .eq('listings.host_id', hostId)
      .eq('status', 'pending');

    if (error) throw error;
    return count || 0;
  }
}
