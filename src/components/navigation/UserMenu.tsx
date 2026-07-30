'use client';

import { Menu, UserCircle } from 'lucide-react';
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

import { ExtendedProfile } from '@/features/auth/components/ProfileForm';

interface UserMenuProps {
  user?: User | null;
  profile?: ExtendedProfile | null;
}

export function UserMenu({ user, profile }: UserMenuProps) {
  // If no user, render the logged out menu
  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex h-10 items-center gap-2 rounded-full border-border bg-background px-2 hover:shadow-md"
          >
            <Menu className="h-4 w-4" />
            <UserCircle className="h-6 w-6 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild className="cursor-pointer font-medium">
            <Link href="/login">Log in</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer font-medium">
            <Link href="/signup">Sign up</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Helper to resolve avatar path (legacy) or the actual `avatar_url` to a public URL.
  // Accepts `string | null | undefined` because the UI type may be undefined.
  const getAvatarUrl = (path: string | null | undefined) => {
    if (!path) return undefined;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
  };

  const avatarUrl = getAvatarUrl(profile?.avatar_path);
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
        <Button
          variant="outline"
          className="flex h-10 items-center gap-2 rounded-full border-border bg-background px-2 hover:shadow-md"
        >
          <Menu className="h-4 w-4" />
          <Avatar className="h-7 w-7">
            <AvatarImage src={avatarUrl} alt={profile?.full_name || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild className="cursor-pointer font-medium">
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer font-medium">
          <Link href="/bookings">My Bookings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer font-medium">
          <Link href="/favorites">Favorites</Link>
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
