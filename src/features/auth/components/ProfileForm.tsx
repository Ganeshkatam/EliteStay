'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileInput } from '../schemas/profile-schemas';
import { updateProfile } from '../actions/profile-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvatarUploader } from './AvatarUploader';
import { Loader2 } from 'lucide-react';

import { type Database } from '@/types/supabase';

type BaseProfile = Database['public']['Tables']['profiles']['Row'];
/**
 * Extended profile type used by the profile form. Includes optional fields
 * that are not part of the core `profiles` table but are required for the UI.
 */
export type ExtendedProfile = BaseProfile & {
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  city?: string;
  avatar_path?: string; // legacy field; map to `avatar_url` if needed
};

interface ProfileFormProps {
  profile: ExtendedProfile;
  email: string | undefined;
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      display_name: profile.display_name || '',
      phone: profile.phone || '',
      bio: profile.bio || '',
      date_of_birth: profile.date_of_birth || '',
      gender: profile.gender || '',
      city: profile.city || '',
    },
  });

  async function onSubmit(data: ProfileInput) {
    setIsPending(true);
    setServerError(null);
    setSuccessMsg(null);

    const result = await updateProfile(data);

    if (result?.error) {
      setServerError(result.error.message);
    } else {
      setSuccessMsg('Profile updated successfully.');
    }

    setIsPending(false);
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>
        <AvatarUploader
          currentPath={profile.avatar_path}
          fullName={profile.full_name}
        />
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input {...register('full_name')} placeholder="Legal Name" />
              {errors.full_name && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Display Name
              </label>
              <Input
                {...register('display_name')}
                placeholder="How you want to be called"
              />
              {errors.display_name && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.display_name.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Bio</label>
              <Input
                {...register('bio')}
                placeholder="Tell us about yourself"
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.bio.message}
                </p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Contact & Demographics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input value={email || ''} disabled className="bg-slate-50" />
              <p className="mt-1 text-xs text-muted-foreground">
                Contact support to change your email.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <Input {...register('phone')} placeholder="+91XXXXXXXXXX" />
              {errors.phone && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <Input {...register('city')} placeholder="e.g. Bangalore" />
              {errors.city && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select
                {...register('gender')}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {serverError && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive font-medium">
            {serverError}
          </div>
        )}

        {successMsg && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 font-medium">
            {successMsg}
          </div>
        )}

        <div className="flex justify-end border-t pt-6">
          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
