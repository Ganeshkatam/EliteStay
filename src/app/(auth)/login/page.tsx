'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from '@/features/auth/actions/auth-actions';
import {
  loginSchema,
  type LoginInput,
} from '@/features/auth/schemas/auth-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2 } from 'lucide-react';
import { OAuthButton } from '@/features/auth/components/OAuthButton';
import { OAuthDivider } from '@/features/auth/components/OAuthDivider';

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  // Map common OAuth/Auth errors to friendly messages
  const getErrorMessage = (errorCode: string | null) => {
    if (!errorCode) return null;
    switch (errorCode) {
      case 'access_denied':
        return 'Access was denied. Please authorize the application to continue.';
      case 'server_error':
        return 'An error occurred with the authentication provider. Please try again.';
      case 'temporarily_unavailable':
        return 'The authentication provider is temporarily unavailable.';
      case 'auth_failed':
        return 'Authentication failed. Please try again.';
      default:
        // Attempt to render the raw error nicely if we don't recognize it
        return `Authentication failed: ${errorCode.replace(/_/g, ' ')}`;
    }
  };

  const [serverError, setServerError] = useState<string | null>(
    getErrorMessage(errorParam)
  );
  const [isPending, setIsPending] = useState(false);
  const reason = searchParams.get('reason');
  const returnTo = searchParams.get('returnTo');
  const nextParams = searchParams.get('next');

  // Resolve the intended destination for OAuth callback
  const nextDestination = returnTo || nextParams || '/';

  let headline = 'Sign in to your account';
  let subheadline = '';

  if (reason === 'booking') {
    headline = 'Continue your booking';
    subheadline = 'Sign in to continue.';
  } else if (reason === 'save') {
    headline = 'Save this accommodation';
    subheadline = 'Sign in to continue.';
  } else if (reason === 'message') {
    headline = 'Continue messaging the host';
    subheadline = 'Sign in to continue.';
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsPending(true);
    setServerError(null);

    const result = await login(data);

    if (result?.error) {
      setServerError(result.error.message);
    }

    setIsPending(false);
  }

  return (
    <>
      <div className="mb-10">
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            EliteStay
          </span>
        </Link>
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        {headline}
      </h2>
      {subheadline && (
        <p className="mt-2 text-lg text-slate-600">{subheadline}</p>
      )}
      <p className="mt-2 text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-semibold text-blue-600 hover:text-blue-500"
        >
          Sign up
        </Link>
      </p>

      <div className="mt-8">
        <OAuthButton
          provider="google"
          next={nextDestination}
          className="w-full"
        />

        <OAuthDivider text="or continue with email" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">
              Email address
            </label>
            <div className="mt-2">
              <Input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium leading-6 text-slate-900">
                Password
              </label>
              <div className="text-sm leading-6">
                <Link
                  href="/forgot-password"
                  className="font-semibold text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <Input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="w-full"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {serverError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {serverError}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
