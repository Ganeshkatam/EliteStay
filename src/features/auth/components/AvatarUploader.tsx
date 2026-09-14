'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { uploadAvatar } from '../actions/profile-actions';
import { Loader2, Upload } from 'lucide-react';

interface AvatarUploaderProps {
  currentPath: string | null | undefined;
  fullName: string | null;
}

export function AvatarUploader({ currentPath, fullName }: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoading, setImageLoading] = useState(Boolean(currentPath));
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to resolve avatar path to a public URL.
  // Accepts string, null, or undefined because the prop may be undefined.
  const getAvatarStorageUrl = (path: string | null | undefined) => {
    if (!path) return undefined;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
  };

  const avatarUrl = getAvatarStorageUrl(currentPath);
  const initials = fullName
    ? fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError('File size must be less than 3MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadAvatar(formData);
    if (result?.error) {
      setError(result.error.message);
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="h-24 w-24 border border-slate-200 shadow-sm relative overflow-hidden">
          {avatarUrl && imageLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 animate-pulse">
              <div className="h-full w-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-[shimmer_1.5s_infinite]" />
            </div>
          )}
          <AvatarImage
            src={avatarUrl}
            className="object-cover transition-opacity duration-300"
            onLoadingStatusChange={(status) => {
              setImageLoading(status === 'loading');
            }}
          />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {isUploading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-slate-900/60 backdrop-blur-xs">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Change Photo
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WebP. Max size 3MB.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
