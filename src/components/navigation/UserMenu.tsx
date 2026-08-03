'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/features/auth/actions/auth-actions';

import { type ExtendedProfile } from '@/types/profile';

import { type HeaderVariant } from '../header/useHeaderState';

interface UserMenuProps {
  user?: User | null;
  profile?: ExtendedProfile | null;
  variant?: HeaderVariant;
}

export function UserMenu({ user, profile }: UserMenuProps) {
  // If no user, render the logged out menu
  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
        >
          Log in
        </Link>
        <Button
          asChild
          className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-none font-medium h-10 px-5"
        >
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
    );
  }

  // Helper to resolve avatar path (legacy) or the actual `avatar_url` to a public URL.
  // Accepts `string | null | undefined` because the UI type may be undefined.
  const getAvatarStorageUrl = (path: string | null | undefined) => {
    if (!path) return undefined;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
  };

  const avatarUrl = getAvatarStorageUrl(profile?.avatar_storage_path);
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center rounded-lg p-0.5 hover:ring-2 hover:ring-slate-300 transition-all outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
          <Avatar className="h-9 w-9 rounded-lg">
            <AvatarImage src={avatarUrl} alt={profile?.full_name || 'User'} />
            <AvatarFallback className="rounded-lg bg-slate-900 text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild className="cursor-pointer font-medium">
          <Link href="/users/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer font-medium">
          <Link href="/users/inbox">Inbox</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer font-medium">
          <Link href="/users/notifications">Notifications</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer font-medium">
          <Link href="/users/settings">Account Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="cursor-pointer font-medium text-blue-600 focus:text-blue-600 focus:bg-blue-50"
        >
          <Link href="/host">Switch to hosting</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async () => {
            await signOut();
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
