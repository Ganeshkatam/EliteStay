'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from '@/features/auth/actions/auth-actions';
import {
  loginSchema,
  type LoginInput,
} from '@/features/auth/schemas/auth-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

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
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        Sign in to your account
      </h2>
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
