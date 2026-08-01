import { createClient } from '@/lib/supabase/server';

export async function getGuestStays() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('stays')
    .select(`
      *,
      listings (
        id,
        title,
        public_id,
        location:city,
        host_id
      ),
      reviews ( id )
    `)
    .eq('guest_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching guest stays:', error);
    return [];
  }

  return data;
}

export async function getHostStays() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('stays')
    .select(`
      *,
      listings!inner (
        id,
        title,
        public_id,
        host_id
      ),
      guest:profiles!stays_guest_id_fkey (
        id,
        full_name,
        avatar_storage_path
      )
    `)
    .eq('listings.host_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching host stays:', error);
    return [];
  }

  return data;
}
