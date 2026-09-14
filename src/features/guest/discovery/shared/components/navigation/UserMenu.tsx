'use client';

import React from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import {
  Menu,
  User as UserIcon,
  Home,
  MessageSquare,
  Bell,
  Settings,
  ShieldCheck,
  Sparkles,
  LogOut,
  Compass,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
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
  const email = user.email || '';
  const isHostRole = profile?.role === 'host' || variant === 'host';

  const initials =
    displayName
      .split(' ')
      .map((n: string) => n[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id="user-profile-menu-button"
          aria-label="User navigation menu"
          className="group flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white p-1.5 pl-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-[0.98]"
        >
          <Menu className="h-4 w-4 text-slate-600 group-hover:text-slate-900 transition-colors" />
          <div className="relative">
            <Avatar className="h-8 w-8 rounded-full ring-1 ring-slate-200/80 shadow-xs">
              <AvatarImage
                src={avatarUrl}
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="rounded-full bg-gradient-to-br from-slate-800 to-slate-950 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-white" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xl shadow-slate-900/10 animate-in fade-in-0 zoom-in-95"
      >
        {/* User Identity Header */}
        <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {displayName}
          </p>
          {email && (
            <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>
          )}
        </div>

        {/* Primary Navigation Items */}
        <div className="space-y-0.5">
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 focus:bg-slate-100/80 transition-colors"
          >
            <Link
              href="/users/inbox"
              className="flex items-center gap-2.5 w-full text-sm font-medium"
            >
              <MessageSquare className="h-4 w-4 text-slate-500" />
              <span>Inbox</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 focus:bg-slate-100/80 transition-colors"
          >
            <Link
              href="/users/notifications"
              className="flex items-center gap-2.5 w-full text-sm font-medium"
            >
              <Bell className="h-4 w-4 text-slate-500" />
              <span>Notifications</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 focus:bg-slate-100/80 transition-colors"
          >
            <Link
              href="/resident"
              className="flex items-center gap-2.5 w-full text-sm font-medium"
            >
              <Home className="h-4 w-4 text-slate-500" />
              <span>Resident Portal</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 focus:bg-slate-100/80 transition-colors"
          >
            <Link
              href="/users/profile"
              className="flex items-center gap-2.5 w-full text-sm font-medium"
            >
              <UserIcon className="h-4 w-4 text-slate-500" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        {/* Mode / Hosting Actions */}
        <div className="space-y-0.5">
          {variant === 'host' ? (
            <>
              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-xl px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 focus:bg-slate-100/80 transition-colors"
              >
                <Link
                  href="/"
                  className="flex items-center gap-2.5 w-full text-sm font-medium"
                >
                  <Compass className="h-4 w-4 text-slate-500" />
                  <span>Switch to Guest View</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-xl px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 focus:bg-slate-100/80 transition-colors"
              >
                <Link
                  href="/host/profile"
                  className="flex items-center gap-2.5 w-full text-sm font-medium"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  <span>Host Settings</span>
                </Link>
              </DropdownMenuItem>
            </>
          ) : isHostRole ? (
            <DropdownMenuItem
              asChild
              className="cursor-pointer rounded-xl px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 focus:bg-slate-100/80 transition-colors"
            >
              <Link
                href="/host"
                className="flex items-center gap-2.5 w-full text-sm font-medium"
              >
                <Sparkles className="h-4 w-4 text-rose-500" />
                <span>Switch to hosting</span>
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              asChild
              className="cursor-pointer rounded-xl px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 focus:bg-slate-100/80 transition-colors"
            >
              <Link
                href="/host/start"
                className="flex items-center gap-2.5 w-full text-sm font-medium"
              >
                <Sparkles className="h-4 w-4 text-rose-500" />
                <span>Become a Host</span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 focus:bg-slate-100/80 transition-colors"
          >
            <Link
              href="/users/settings"
              className="flex items-center gap-2.5 w-full text-sm font-medium"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        {/* Sign Out Action */}
        <DropdownMenuItem
          className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 focus:bg-rose-50/80 focus:text-rose-700 transition-colors flex items-center gap-2.5"
          onClick={async () => {
            await signOut();
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
