'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signup } from '@/features/auth/actions/auth-actions';
import {
  signupSchema,
  type SignupInput,
} from '@/features/auth/schemas/auth-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2 } from 'lucide-react';

function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  let headline = 'Create an account';
  let subheadline = '';

  if (reason === 'booking') {
    headline = 'Continue your booking';
    subheadline = 'Create an account to continue.';
  } else if (reason === 'save') {
    headline = 'Save this accommodation';
    subheadline = 'Create an account to continue.';
  } else if (reason === 'message') {
    headline = 'Continue messaging the host';
    subheadline = 'Create an account to continue.';
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupInput) {
    setIsPending(true);
    setServerError(null);

    const result = await signup(data);

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
        <p className="mt-2 text-lg text-slate-600">
          {subheadline}
        </p>
      )}
      <p className="mt-2 text-sm text-slate-600">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:text-blue-500"
        >
          Sign in
        </Link>
      </p>

      <div className="mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium leading-6 text-slate-800">
              Full name
            </label>
            <div className="mt-2">
              <Input
                {...register('full_name')}
                type="text"
                autoComplete="name"
                className="w-full"
                placeholder="Jane Doe"
              />
              {errors.full_name && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.full_name.message}
                </p>
              )}
            </div>
          </div>

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
            <label className="block text-sm font-medium leading-6 text-slate-900">
              Password
            </label>
            <div className="mt-2">
              <Input
                {...register('password')}
                type="password"
                autoComplete="new-password"
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
              {isPending ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
