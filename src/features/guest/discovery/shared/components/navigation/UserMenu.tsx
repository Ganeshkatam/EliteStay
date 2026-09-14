'use client';

import React from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type ExtendedProfile } from '@/types/profile';
import { type HeaderVariant } from './useHeaderState';

interface UserMenuProps {
  user?: User | null;
  profile?: ExtendedProfile | null;
  variant?: HeaderVariant;
}

export function UserMenu({ user, profile, variant }: UserMenuProps) {
  // If no user, render the logged out navigation options
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors hidden sm:block px-3 py-2 rounded-full hover:bg-slate-100"
        >
          Log in
        </Link>
        <Button
          asChild
          className="rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-sm font-medium h-10 px-5 transition-transform active:scale-95"
        >
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
    );
  }

  // Resolve avatar URL from storage path or external URL
  const getAvatarStorageUrl = (path: string | null | undefined) => {
    if (!path) return undefined;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
  };

  const avatarUrl = getAvatarStorageUrl(profile?.avatar_storage_path);
  const displayName =
    profile?.full_name || user.email?.split('@')[0] || 'Member';

  const initials =
    displayName
      .split(' ')
      .map((n: string) => n[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  return (
    <div className="flex items-center">
      <Link
        href="/users/profile"
        id="user-profile-button"
        aria-label="User profile"
        className="relative flex items-center justify-center rounded-full outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-transform active:scale-95 group"
      >
        <Avatar className="h-10 w-10 rounded-full ring-2 ring-slate-200/90 group-hover:ring-slate-300 shadow-xs transition-all">
          <AvatarImage
            src={avatarUrl}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="rounded-full bg-gradient-to-br from-slate-800 to-slate-950 text-white text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
      </Link>
    </div>
  );
}
