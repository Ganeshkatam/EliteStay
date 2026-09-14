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
  ChevronRight,
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
        className="w-72 sm:w-80 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl p-2 shadow-2xl shadow-slate-900/10 animate-in fade-in-0 zoom-in-95"
      >
        {/* User Identity Header Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/90 border border-slate-100 mb-1">
          <Avatar className="h-11 w-11 rounded-xl ring-1 ring-slate-200 shadow-xs">
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="rounded-xl bg-slate-900 text-white text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-slate-900 truncate leading-snug">
                {displayName}
              </p>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isHostRole
                    ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                }`}
              >
                {isHostRole ? 'Host' : 'Guest'}
              </span>
            </div>
            {email && (
              <p className="text-xs text-slate-500 truncate leading-snug">
                {email}
              </p>
            )}
          </div>
        </div>

        {/* Mode Switcher Banner */}
        <div className="px-1 py-1 mb-1">
          {variant === 'host' ? (
            <Link
              href="/"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 border border-slate-200/60 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-semibold text-slate-800">
                  Switch to Guest View
                </span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : isHostRole ? (
            <Link
              href="/host"
              className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 hover:from-rose-500/15 hover:to-rose-500/15 border border-rose-200/60 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-rose-600" />
                <span className="text-xs font-semibold text-rose-950">
                  Switch to Hosting
                </span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <Link
              href="/host/start"
              className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 hover:from-rose-100/70 hover:to-orange-100/70 border border-rose-200/60 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-rose-600" />
                <span className="text-xs font-semibold text-rose-950">
                  Become a Host
                </span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        {/* Primary Navigation Items */}
        <div className="space-y-0.5">
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl py-2 px-2.5 hover:bg-slate-50 focus:bg-slate-50"
          >
            <Link
              href="/users/profile"
              className="flex items-center gap-3 w-full"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 leading-tight">
                  Guest Profile
                </span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  View personal information & reviews
                </span>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl py-2 px-2.5 hover:bg-slate-50 focus:bg-slate-50"
          >
            <Link href="/resident" className="flex items-center gap-3 w-full">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Home className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 leading-tight">
                  Resident Portal
                </span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Active leases, rent & maintenance
                </span>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl py-2 px-2.5 hover:bg-slate-50 focus:bg-slate-50"
          >
            <Link
              href="/users/inbox"
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900 leading-tight">
                    Inbox
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Conversations with hosts
                  </span>
                </div>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl py-2 px-2.5 hover:bg-slate-50 focus:bg-slate-50"
          >
            <Link
              href="/users/notifications"
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900 leading-tight">
                    Notifications
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Updates on requests & stays
                  </span>
                </div>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl py-2 px-2.5 hover:bg-slate-50 focus:bg-slate-50"
          >
            <Link
              href="/users/settings"
              className="flex items-center gap-3 w-full"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                <Settings className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 leading-tight">
                  Account Settings
                </span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Preferences, security & privacy
                </span>
              </div>
            </Link>
          </DropdownMenuItem>

          {variant === 'host' && (
            <DropdownMenuItem
              asChild
              className="cursor-pointer rounded-xl py-2 px-2.5 hover:bg-slate-50 focus:bg-slate-50"
            >
              <Link
                href="/host/profile"
                className="flex items-center gap-3 w-full"
              >
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-rose-700 leading-tight">
                    Host Verification & Settings
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Payout accounts & policies
                  </span>
                </div>
              </Link>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        {/* Sign Out Action */}
        <DropdownMenuItem
          className="cursor-pointer rounded-xl py-2 px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 focus:bg-rose-50/80 focus:text-rose-700 transition-colors flex items-center gap-3"
          onClick={async () => {
            await signOut();
          }}
        >
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Sign out</span>
        </DropdownMenuItem>

        {/* Micro Version Stamp */}
        <div className="pt-2 pb-1 text-center">
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            EliteStay v1.0.0
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
