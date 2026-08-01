'use server';

import { createClient } from '@/lib/supabase/server';
import { PreferenceCategory, PreferenceSchemas } from '../types/preferences';
import { revalidatePath } from 'next/cache';

/**
 * Updates a specific category of user preferences
 *
 * @param category The preference category to update (e.g. 'privacy')
 * @param data The partial or full data object for that category
 */
export async function updateUserPreferences<T extends PreferenceCategory>(
  category: T,
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    // 1. Validate the payload using Zod before touching the database
    const schema = PreferenceSchemas[category];
    const validatedData = schema.parse(data);

    // 2. Perform the update
    // Because the columns in Postgres are JSONB, Supabase allows updating the column directly.
    const { error } = await supabase
      .from('user_preferences')
      .update({
        [category]: validatedData,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error(`Error updating ${category} preferences:`, error);
      return { success: false, error: error.message };
    }

    revalidatePath('/users/settings');
    return { success: true };
  } catch (err: unknown) {
    console.error('Validation or API error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Validation failed',
    };
  }
}
