import { createClient } from '@/lib/supabase/server';
import { 
  UserPreferences 
} from '../types/preferences';

/**
 * Retrieves the user's preferences from the database
 * MUST be called from a Server Component.
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching preferences:', error);
    return null;
  }

  // Force cast to UserPreferences since DB returns generic JSON for JSONB columns
  return data as unknown as UserPreferences;
}
