import { type SupabaseClient } from '@supabase/supabase-js';

export class UnauthorizedAalError extends Error {
  constructor(
    message = 'Two-Factor Authentication (AAL2) is required to perform this action.'
  ) {
    super(message);
    this.name = 'UnauthorizedAalError';
  }
}

/**
 * Asserts that if an authenticated user has an enrolled, verified MFA factor,
 * their current session must be elevated to AAL2 before proceeding.
 *
 * @param supabase Authenticated Supabase Server Client
 * @returns Verification context with userId and current assurance level
 */
export async function assertAal2IfEnrolled(supabase: SupabaseClient): Promise<{
  userId: string;
  currentLevel: 'aal1' | 'aal2';
  nextLevel: 'aal1' | 'aal2';
}> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  const { data: aal, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalError) {
    throw new Error(
      `Failed to verify authentication assurance level: ${aalError.message}`
    );
  }

  if (aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
    throw new UnauthorizedAalError(
      'Two-Factor Authentication (AAL2) is required to perform this action.'
    );
  }

  return {
    userId: user.id,
    currentLevel: aal.currentLevel as 'aal1' | 'aal2',
    nextLevel: aal.nextLevel as 'aal1' | 'aal2',
  };
}
