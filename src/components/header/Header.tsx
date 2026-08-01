import { createClient } from '@/lib/supabase/server';
import { type ExtendedProfile } from '@/types/profile';
import { HeaderLayout } from './HeaderLayout';

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: ExtendedProfile | null = null;
  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_storage_path')
      .eq('id', user.id)
      .maybeSingle();
    if (error) {
      console.error('Header profile fetch error:', error.message || error);
    }
    profile = data as ExtendedProfile | null;
  }

  return <HeaderLayout user={user} profile={profile} />;
}
