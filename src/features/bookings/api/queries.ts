import { createClient } from '@/lib/supabase/server';

export async function getHostBookings() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch bookings where the host owns the listing
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      listings!inner (
        id,
        title,
        host_id
      ),
      guest:profiles!bookings_guest_id_fkey (
        id,
        full_name,
        avatar_storage_path
      )
    `)
    .eq('listings.host_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching host bookings:', error);
    return [];
  }

  return data;
}

export async function getGuestBookings() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      listings (
        id,
        title,
        public_id,
        location:city
      )
    `)
    .eq('guest_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching guest bookings:', error);
    return [];
  }

  return data;
}
