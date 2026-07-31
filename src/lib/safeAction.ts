import { createClient } from '@/lib/supabase/server';
import { User, SupabaseClient } from '@supabase/supabase-js';

type ActionState<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

export async function safeAction<T>(
  actionFn: (user: User, supabase: SupabaseClient) => Promise<T>
): Promise<ActionState<T>> {
  try {
    const supabase = await createClient();
    
    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Unauthorized. Please log in.' };
    }

    // Execute with validated user
    const data = await actionFn(user, supabase);
    
    return { success: true, data };
  } catch (error: unknown) {
    console.error('Server Action Error:', error);
    
    // Prevent leaking SQL errors or sensitive backend info
    const err = error as { code?: string; message?: string };
    if (err.code && err.code.startsWith('23')) {
      return { error: 'A data conflict occurred. Please try again.' };
    }
    
    return { error: err.message || 'An unexpected error occurred.' };
  }
}
