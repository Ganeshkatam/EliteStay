'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPassword } from '@/features/auth/actions/auth-actions';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/features/auth/schemas/auth-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setIsPending(true);
    setServerError(null);

    const result = await forgotPassword(data);

    if (result?.error) {
      setServerError(result.error.message);
    } else {
      setIsSuccess(true);
    }

    setIsPending(false);
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Check your email
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          We&apos;ve sent you a link to reset your password. Please check your
          inbox.
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            &larr; Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        Reset password
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Remember your password?{' '}
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
              {isPending ? 'Sending link...' : 'Send reset link'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
