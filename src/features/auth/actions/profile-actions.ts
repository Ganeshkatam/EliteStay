'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { profileSchema, type ProfileInput } from '../schemas/profile-schemas';
import { type AuthResult } from '../types/errors';
import * as NotificationService from '@/features/notifications/actions/notification-actions';

export async function updateProfile(
  data: Partial<ProfileInput>
): Promise<AuthResult> {
  const parsed = profileSchema.partial().safeParse(data);

  if (!parsed.success) {
    return {
      error: {
        code: 'validation_error',
        message: 'Invalid profile data',
        details: parsed.error.flatten(),
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: {
        code: 'unauthenticated',
        message: 'You must be logged in to update your profile',
      },
    };
  }

  // Format fields to be null if empty string
  const formattedData = {
    ...parsed.data,
    phone: parsed.data.phone === '' ? null : parsed.data.phone,
    date_of_birth:
      parsed.data.date_of_birth === '' ? null : parsed.data.date_of_birth,
    gender:
      parsed.data.gender === ''
        ? null
        : (parsed.data.gender as 'male' | 'female' | null | undefined),
  };

  const { error } = await supabase
    .from('profiles')
    .update(formattedData)
    .eq('id', user.id);

  if (error) {
    return {
      error: {
        code: 'server_error',
        message: error.message,
      },
    };
  }

  // Fire and forget notification
  NotificationService.notifyProfileUpdated(user.id).catch(console.error);

  revalidatePath('/', 'layout');
  return { data: undefined };
}

export async function uploadAvatar(
  formData: FormData
): Promise<AuthResult<{ avatar_storage_path: string }>> {
  const file = formData.get('file') as File | null;

  if (!file) {
    return {
      error: {
        code: 'validation_error',
        message: 'No file provided',
      },
    };
  }

  if (file.size > 3 * 1024 * 1024) {
    return {
      error: {
        code: 'validation_error',
        message: 'File size must be less than 3MB',
      },
    };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      error: {
        code: 'validation_error',
        message: 'Only JPG, PNG and WebP files are allowed',
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: {
        code: 'unauthenticated',
        message: 'You must be logged in to upload an avatar',
      },
    };
  }

  // Fetch current avatar to delete it later
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_storage_path')
    .eq('id', user.id)
    .single();

  const currentAvatar = profile?.avatar_storage_path;

  // Generate filename: user.id/avatar.webp
  const filePath = `${user.id}/avatar.webp`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return {
      error: {
        code: 'server_error',
        message: uploadError.message,
      },
    };
  }

  // Update Profile
  // We append a timestamp to the path in the DB so that the UI can bust the image cache
  // Next time the UI fetches this, it will fetch `/avatar.webp?t=12345`
  const dbPath = `${filePath}?t=${Date.now()}`;
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_storage_path: dbPath })
    .eq('id', user.id);

  if (updateError) {
    return {
      error: {
        code: 'server_error',
        message: updateError.message,
      },
    };
  }

  // Cleanup old avatar if it existed and is different from the new path
  const oldPathWithoutQuery = currentAvatar?.split('?')[0];
  if (oldPathWithoutQuery && oldPathWithoutQuery !== filePath) {
    await supabase.storage.from('avatars').remove([oldPathWithoutQuery]);
  }

  revalidatePath('/', 'layout');
  return { data: { avatar_storage_path: dbPath } };
}
