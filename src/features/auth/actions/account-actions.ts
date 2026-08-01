'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteAccount() {
  const supabase = await createClient();

  const { error } = await supabase.rpc('delete_user_account');

  if (error) {
    return {
      error: {
        code: 'server_error',
        message: error.message,
      },
    };
  }

  // Sign out locally
  await supabase.auth.signOut();

  // Redirect to homepage
  revalidatePath('/', 'layout');
  redirect('/');
}
