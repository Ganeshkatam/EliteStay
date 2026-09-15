'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  login,
  verifyLoginMfa,
  cancelMfaLogin,
  type MfaFactorSummary,
} from '@/features/auth/actions/auth-actions';
import {
  loginSchema,
  type LoginInput,
} from '@/features/auth/schemas/auth-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  ShieldCheck,
  Smartphone,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { OAuthButton } from '@/features/auth/components/OAuthButton';
import { OAuthDivider } from '@/features/auth/components/OAuthDivider';

type LoginStep = 'credentials' | 'factor_selection' | 'mfa_challenge';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

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
        return `Authentication failed: ${errorCode.replace(/_/g, ' ')}`;
    }
  };

  const [step, setStep] = useState<LoginStep>('credentials');
  const [serverError, setServerError] = useState<string | null>(
    getErrorMessage(errorParam)
  );

  // Loading states
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);
  const [isSubmittingMfa, setIsSubmittingMfa] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // MFA State
  const [mfaFactors, setMfaFactors] = useState<MfaFactorSummary[]>([]);
  const [selectedFactorId, setSelectedFactorId] = useState<string>('');
  const [totpCode, setTotpCode] = useState<string>('');

  const reason = searchParams.get('reason');
  const returnTo = searchParams.get('returnTo');
  const nextParams = searchParams.get('next');

  // Resolved destination
  const destination = returnTo || nextParams || '/';

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
    defaultValues: {
      destination,
    },
  });

  // 1. Submit Credentials
  async function onCredentialsSubmit(data: LoginInput) {
    setIsSubmittingCredentials(true);
    setServerError(null);

    const result = await login({
      ...data,
      destination,
    });

    if (result?.error) {
      setServerError(result.error.message);
      setIsSubmittingCredentials(false);
      return;
    }

    if (result?.data?.mfaRequired) {
      const factors = result.data.factors;
      setMfaFactors(factors);

      if (factors.length === 1 && result.data.selectedFactorId) {
        setSelectedFactorId(result.data.selectedFactorId);
        setStep('mfa_challenge');
      } else if (factors.length > 1) {
        setSelectedFactorId(factors[0].id);
        setStep('factor_selection');
      } else {
        setServerError('No verified MFA factors found.');
      }
      setIsSubmittingCredentials(false);
      return;
    }

    // Normal login completed
    if (result?.data?.destination) {
      router.push(result.data.destination);
    }
  }

  // 2. Submit MFA Challenge
  async function onMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!totpCode || totpCode.length !== 6 || isSubmittingMfa) return;

    setIsSubmittingMfa(true);
    setServerError(null);

    const result = await verifyLoginMfa({
      factorId: selectedFactorId,
      code: totpCode.trim(),
      destination,
    });

    if (result?.error) {
      setServerError(result.error.message);
      setIsSubmittingMfa(false);
      return;
    }

    if (result?.data?.destination) {
      router.push(result.data.destination);
    }
  }

  // 3. Cancel MFA and return to credentials
  async function handleCancelMfa() {
    setIsCancelling(true);
    setServerError(null);
    try {
      await cancelMfaLogin();
    } catch {
      // Ignore network cancellation glitches
    } finally {
      setTotpCode('');
      setSelectedFactorId('');
      setMfaFactors([]);
      setStep('credentials');
      setIsCancelling(false);
    }
  }

  // RENDER: Step 2 - Factor Selection (When >1 verified factor exists)
  if (step === 'factor_selection') {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              EliteStay
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Select Authenticator Method
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose which registered device to verify with.
            </p>
          </div>
        </div>

        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {serverError}
          </div>
        )}

        <div className="space-y-3">
          {mfaFactors.map((factor) => {
            const isSelected = factor.id === selectedFactorId;
            return (
              <button
                key={factor.id}
                type="button"
                onClick={() => setSelectedFactorId(factor.id)}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone
                    className={`h-5 w-5 ${
                      isSelected ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {factor.friendlyName}
                    </p>
                    <p className="text-xs text-slate-500">TOTP Authenticator</p>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            type="button"
            className="w-full bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => setStep('mfa_challenge')}
          >
            Continue with Selected Method
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={isCancelling}
            onClick={handleCancelMfa}
            className="w-full text-slate-600 hover:text-slate-900"
          >
            {isCancelling ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ArrowLeft className="h-4 w-4 mr-2" />
            )}
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // RENDER: Step 3 - TOTP 6-Digit Code Challenge
  if (step === 'mfa_challenge') {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              EliteStay
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Two-Factor Verification
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>
        </div>

        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {serverError}
          </div>
        )}

        <form onSubmit={onMfaSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="mfa-totp-code"
              className="block text-sm font-medium text-slate-900"
            >
              Authentication Code
            </label>
            <Input
              id="mfa-totp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              disabled={isSubmittingMfa}
              value={totpCode}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '');
                setTotpCode(clean);
              }}
              placeholder="000000"
              className="h-13 text-center text-2xl font-mono tracking-widest font-semibold border-slate-200 focus-visible:ring-indigo-600"
            />
            <p className="text-xs text-slate-500 text-center pt-1">
              Open Google Authenticator, 1Password, or Authy to view your active
              code.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              disabled={totpCode.length !== 6 || isSubmittingMfa}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 h-11"
            >
              {isSubmittingMfa ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying Code...
                </>
              ) : (
                'Verify & Complete Sign In'
              )}
            </Button>

            {mfaFactors.length > 1 && (
              <Button
                type="button"
                variant="outline"
                disabled={isSubmittingMfa}
                onClick={() => setStep('factor_selection')}
                className="w-full border-slate-200 text-slate-700"
              >
                Choose a different method
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              disabled={isCancelling || isSubmittingMfa}
              onClick={handleCancelMfa}
              className="w-full text-slate-600 hover:text-slate-900"
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ArrowLeft className="h-4 w-4 mr-2" />
              )}
              Cancel and Back to Sign In
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // RENDER: Step 1 - Initial Credentials
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

      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
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
        <OAuthButton provider="google" next={destination} className="w-full" />

        <OAuthDivider text="or continue with email" />

        <form
          onSubmit={handleSubmit(onCredentialsSubmit)}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">
              Email address
            </label>
            <div className="mt-2">
              <Input
                {...register('email')}
                type="email"
                autoComplete="email"
                disabled={isSubmittingCredentials}
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
                disabled={isSubmittingCredentials}
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
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              {serverError}
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full bg-slate-900 text-white hover:bg-slate-800 h-11"
              disabled={isSubmittingCredentials}
            >
              {isSubmittingCredentials ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
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
