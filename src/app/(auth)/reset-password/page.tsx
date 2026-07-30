'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPassword } from '@/features/auth/actions/auth-actions';
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@/features/auth/schemas/auth-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ResetPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordInput) {
    setIsPending(true);
    setServerError(null);

    const result = await resetPassword(data);

    if (result?.error) {
      setServerError(result.error.message);
    }

    setIsPending(false);
  }

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        Create new password
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Please enter your new password below.
      </p>

      <div className="mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">
              New Password
            </label>
            <div className="mt-2">
              <Input
                {...register('password')}
                type="password"
                className="w-full"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">
              Confirm Password
            </label>
            <div className="mt-2">
              <Input
                {...register('confirmPassword')}
                type="password"
                className="w-full"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword.message}
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
              {isPending ? 'Updating...' : 'Update password'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
