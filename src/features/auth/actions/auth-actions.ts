'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type AuthResult } from '../types/errors';
import * as NotificationService from '@/features/notifications/actions/notification-actions';
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  mfaVerifySchema,
  type LoginInput,
  type SignupInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type MfaVerifyInput,
} from '../schemas/auth-schemas';

export interface MfaFactorSummary {
  id: string;
  friendlyName: string;
  factorType: string;
  createdAt: string;
}

export type LoginResultData =
  | {
      mfaRequired: false;
      destination: string;
    }
  | {
      mfaRequired: true;
      factors: MfaFactorSummary[];
      selectedFactorId?: string;
      destination: string;
    };

export interface MfaVerifyResultData {
  destination: string;
}

/**
 * Initiates user login with password.
 * Checks authoritative Supabase assurance level (AAL1 -> AAL2).
 * If MFA is required, validates and returns verified factor(s).
 */
export async function login(
  data: LoginInput
): Promise<AuthResult<LoginResultData>> {
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: {
        code: 'validation_error',
        message:
          parsed.error.issues[0]?.message ||
          'Invalid email, password, or destination format',
        details: parsed.error.flatten(),
      },
    };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    return {
      error: {
        code: 'unauthenticated',
        message: signInError.message,
      },
    };
  }

  // Authoritative AAL Check: currentLevel === 'aal1' && nextLevel === 'aal2'
  const { data: aalData, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalError) {
    return {
      error: {
        code: 'server_error',
        message:
          aalError.message ||
          'Failed to verify authentication assurance level.',
      },
    };
  }

  const destination = parsed.data.destination || '/';

  if (aalData.currentLevel === 'aal1' && aalData.nextLevel === 'aal2') {
    const { data: factorsData, error: factorsError } =
      await supabase.auth.mfa.listFactors();

    if (factorsError) {
      return {
        error: {
          code: 'server_error',
          message:
            factorsError.message || 'Failed to retrieve authenticator factors.',
        },
      };
    }

    const verifiedTotp = (factorsData?.totp || []).filter(
      (f) => f.status === 'verified'
    );

    // Rule: 0 verified factors -> fail safely, sign out partial AAL1 session
    if (verifiedTotp.length === 0) {
      await supabase.auth.signOut();
      return {
        error: {
          code: 'forbidden',
          message:
            'Two-Factor Authentication is required for your account, but no verified authenticator factor is configured. Please use backup recovery codes or contact support.',
        },
      };
    }

    const factorSummaries: MfaFactorSummary[] = verifiedTotp.map((f) => ({
      id: f.id,
      friendlyName: f.friendly_name || 'Authenticator App',
      factorType: f.factor_type,
      createdAt: f.created_at,
    }));

    // Rule: 1 verified factor -> auto-select; >1 verified factors -> prompt user choice
    return {
      data: {
        mfaRequired: true,
        factors: factorSummaries,
        selectedFactorId:
          factorSummaries.length === 1 ? factorSummaries[0].id : undefined,
        destination,
      },
    };
  }

  // Standard non-MFA login: revalidate cache and return destination
  revalidatePath('/', 'layout');
  return {
    data: {
      mfaRequired: false,
      destination,
    },
  };
}

/**
 * Verifies a 6-digit TOTP code against an authenticated user's verified factor.
 * Zero-trust validation: factorId must exist in user's verified factors.
 * Asserts post-challenge elevation to AAL2 before completing authentication.
 */
export async function verifyLoginMfa(
  data: MfaVerifyInput
): Promise<AuthResult<MfaVerifyResultData>> {
  const parsed = mfaVerifySchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: {
        code: 'validation_error',
        message:
          parsed.error.issues[0]?.message ||
          'Invalid verification code or factor identifier',
        details: parsed.error.flatten(),
      },
    };
  }

  const supabase = await createClient();

  // 1. Assert active session exists
  const { data: aalData, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalError || !aalData) {
    return {
      error: {
        code: 'unauthenticated',
        message:
          'No active authentication session found. Please sign in again.',
      },
    };
  }

  if (aalData.currentLevel !== 'aal1' && aalData.currentLevel !== 'aal2') {
    return {
      error: {
        code: 'unauthenticated',
        message: 'Invalid session state. Please sign in again.',
      },
    };
  }

  // 2. Zero-trust factor validation: verify factorId belongs to user and is verified
  const { data: factorsData, error: factorsError } =
    await supabase.auth.mfa.listFactors();

  if (factorsError || !factorsData?.totp) {
    return {
      error: {
        code: 'server_error',
        message: 'Failed to retrieve registered authentication factors.',
      },
    };
  }

  const verifiedFactor = factorsData.totp.find(
    (f) => f.id === parsed.data.factorId && f.status === 'verified'
  );

  if (!verifiedFactor) {
    return {
      error: {
        code: 'forbidden',
        message: 'Unauthorized or invalid authenticator factor identifier.',
      },
    };
  }

  // 3. Challenge and verify TOTP code
  const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
    factorId: verifiedFactor.id,
    code: parsed.data.code,
  });

  if (verifyError) {
    return {
      error: {
        code: 'unauthenticated',
        message:
          verifyError.message ||
          'Invalid or expired 6-digit verification code. Please try again.',
      },
    };
  }

  // 4. Invariant assertion: Verify resulting session is elevated to AAL2
  const { data: postAalData, error: postAalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (postAalError || postAalData?.currentLevel !== 'aal2') {
    return {
      error: {
        code: 'forbidden',
        message:
          'MFA verification failed to elevate session to AAL2. Please sign in again.',
      },
    };
  }

  revalidatePath('/', 'layout');
  return {
    data: {
      destination: parsed.data.destination || '/',
    },
  };
}

/**
 * Cancels pending MFA login challenge by terminating the temporary AAL1 session.
 */
export async function cancelMfaLogin(): Promise<AuthResult> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  return { data: undefined };
}

export async function signup(data: SignupInput): Promise<AuthResult> {
  const parsed = signupSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: {
        code: 'validation_error',
        message: 'Please check your inputs',
        details: parsed.error.flatten(),
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
      },
    },
  });

  if (error) {
    return {
      error: {
        code: 'server_error',
        message: error.message,
      },
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    NotificationService.notifyWelcome(user.id).catch(console.error);
  }

  redirect('/verify-email');
}

export async function forgotPassword(
  data: ForgotPasswordInput
): Promise<AuthResult> {
  const parsed = forgotPasswordSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: {
        code: 'validation_error',
        message: 'Invalid email format',
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback?next=/reset-password`,
    }
  );

  if (error) {
    return {
      error: {
        code: 'server_error',
        message: error.message,
      },
    };
  }

  return { data: undefined };
}

export async function resetPassword(
  data: ResetPasswordInput
): Promise<AuthResult> {
  const parsed = resetPasswordSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: {
        code: 'validation_error',
        message: 'Please check your passwords',
        details: parsed.error.flatten(),
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: {
        code: 'server_error',
        message: error.message,
      },
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    NotificationService.notifyPasswordChanged(user.id).catch(console.error);
  }

  redirect('/login');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  redirect('/login');
}
