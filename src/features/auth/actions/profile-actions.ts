'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { profileSchema, type ProfileInput } from '../schemas/profile-schemas';
import { type AuthResult } from '../types/errors';

export async function updateProfile(data: ProfileInput): Promise<AuthResult> {
  const parsed = profileSchema.safeParse(data);

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

  // Format phone to be null if empty string
  const formattedData = {
    ...parsed.data,
    phone: parsed.data.phone === '' ? null : parsed.data.phone,
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

  revalidatePath('/profile');
  return { data: undefined };
}

export async function uploadAvatar(
  formData: FormData
): Promise<AuthResult<{ avatar_path: string }>> {
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

  // Generate filename: user_id/avatar.webp
  const extension = file.name.split('.').pop();
  const fileName = `avatar_${Date.now()}.${extension}`;
  const filePath = `${user.id}/${fileName}`;

  // Fetch current avatar to delete it later
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', user.id)
    .single();

  const currentAvatar = profile?.avatar_path;

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
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_path: filePath })
    .eq('id', user.id);

  if (updateError) {
    // Rollback storage upload
    await supabase.storage.from('avatars').remove([filePath]);
    return {
      error: {
        code: 'server_error',
        message: updateError.message,
      },
    };
  }

  // Cleanup old avatar if it existed and is different
  if (currentAvatar && currentAvatar !== filePath) {
    await supabase.storage.from('avatars').remove([currentAvatar]);
  }

  revalidatePath('/profile');
  return { data: { avatar_path: filePath } };
}
