'use server';

import { createClient } from '@/lib/supabase/server';
import { PreferenceCategory, PreferenceSchemas } from '../types/preferences';
import { revalidatePath } from 'next/cache';
import { assertAal2IfEnrolled } from '@/lib/auth/mfa-guards';

/**
 * Updates a specific category of user preferences.
 * For sensitive security settings, asserts AAL2 assurance level when MFA is active.
 *
 * @param category The preference category to update (e.g. 'privacy', 'security')
 * @param data The partial or full data object for that category
 */
export async function updateUserPreferences<T extends PreferenceCategory>(
  category: T,
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // 1. Assert AAL2 if enrolled for sensitive security category
    if (category === 'security') {
      await assertAal2IfEnrolled(supabase);
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user)
      return { success: false, error: 'Not authenticated' };

    // 2. Validate the payload using Zod before touching the database
    const schema = PreferenceSchemas[category];
    const validatedData = schema.parse(data);

    // 3. Perform the update
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
    console.error('Validation or security guard error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Validation failed',
    };
  }
}
