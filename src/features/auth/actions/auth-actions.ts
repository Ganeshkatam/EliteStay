'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type AuthResult } from '../types/errors';
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type SignupInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '../schemas/auth-schemas';

export async function login(data: LoginInput): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: {
        code: 'validation_error',
        message: 'Invalid email or password format',
        details: parsed.error.flatten(),
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: {
        code: 'unauthenticated',
        message: error.message,
      },
    };
  }

  revalidatePath('/', 'layout');
  redirect('/');
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

  // Redirect to a verification page or login
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
  // Using an explicit base URL would be safer, but Next.js server actions
  // don't easily give the origin. Supabase uses SITE_URL from dashboard.
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/callback?next=/reset-password`,
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

  redirect('/login');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  redirect('/login');
}
