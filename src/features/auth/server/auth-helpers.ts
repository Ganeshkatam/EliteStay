import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { type User } from '@supabase/supabase-js';

// We need a Profile type. We can define a basic one here for now.
export interface Profile {
  id: string;
  role: 'guest' | 'host' | 'admin';
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

export async function getCurrentProfile(): Promise<{
  user: User;
  profile: Profile;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return { user, profile: profile as Profile };
}

export async function requireUser(redirectTo = '/login'): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectTo);
  }
  return user;
}

export async function requireAdmin(
  redirectTo = '/login'
): Promise<{ user: User; profile: Profile }> {
  const data = await getCurrentProfile();
  if (!data || !data.user) {
    redirect(redirectTo);
  }

  if (data.profile.role !== 'admin') {
    redirect('/forbidden');
  }

  return data;
}
