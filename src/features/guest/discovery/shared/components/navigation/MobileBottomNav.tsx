'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Home,
  MessageSquare,
  Bell,
  User as UserIcon,
} from 'lucide-react';
import { type User } from '@supabase/supabase-js';
import { type ExtendedProfile } from '@/types/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  user?: User | null;
  profile?: ExtendedProfile | null;
  isHost?: boolean;
}

export function MobileBottomNav({ user, profile }: MobileBottomNavProps) {
  const pathname = usePathname() || '/';

  // Do not render bottom nav on checkout / reservation flow to prevent distractions
  if (pathname.startsWith('/reserve')) {
    return null;
  }

  const getAvatarStorageUrl = (path: string | null | undefined) => {
    if (!path) return undefined;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
  };

  const avatarUrl = getAvatarStorageUrl(profile?.avatar_storage_path);
  const initials =
    (profile?.full_name || user?.email?.split('@')[0] || 'U')
      .split(' ')
      .map((n: string) => n[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const isExploreActive =
    pathname === '/' || pathname.startsWith('/s') || pathname.startsWith('/p/');
  const isStaysActive =
    pathname.startsWith('/resident') || pathname.startsWith('/stay');
  const isInboxActive = pathname.startsWith('/users/inbox');
  const isNotificationsActive = pathname.startsWith('/users/notifications');
  const isProfileActive =
    pathname.startsWith('/users/profile') ||
    pathname.startsWith('/users/settings') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup');

  const navItems = [
    {
      id: 'mobile-nav-explore',
      label: 'Explore',
      href: '/',
      icon: Compass,
      isActive: isExploreActive,
    },
    {
      id: 'mobile-nav-stays',
      label: 'My Stays',
      href: user ? '/resident' : '/login?next=/resident',
      icon: Home,
      isActive: isStaysActive,
    },
    {
      id: 'mobile-nav-inbox',
      label: 'Inbox',
      href: user ? '/users/inbox' : '/login?next=/users/inbox',
      icon: MessageSquare,
      isActive: isInboxActive,
    },
    {
      id: 'mobile-nav-activity',
      label: 'Activity',
      href: user ? '/users/notifications' : '/login?next=/users/notifications',
      icon: Bell,
      isActive: isNotificationsActive,
    },
    {
      id: 'mobile-nav-profile',
      label: user ? 'Profile' : 'Log In',
      href: user ? '/users/profile' : '/login',
      icon: UserIcon,
      isActive: isProfileActive,
      isProfile: true,
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] [padding-bottom:max(0.6rem,env(safe-area-inset-bottom))] transition-transform duration-200"
    >
      <div className="grid grid-cols-5 items-center h-14 px-1.5 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.id}
              id={item.id}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 active:scale-90',
                active
                  ? 'text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              )}
            >
              <div className="relative flex items-center justify-center h-6 w-6">
                {item.isProfile && user && avatarUrl ? (
                  <Avatar
                    className={cn(
                      'h-6 w-6 rounded-full transition-all',
                      active
                        ? 'ring-2 ring-slate-900 ring-offset-1'
                        : 'ring-1 ring-slate-300'
                    )}
                  >
                    <AvatarImage
                      src={avatarUrl}
                      alt={profile?.full_name || 'Profile'}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-[9px] bg-slate-900 text-white font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-transform duration-200',
                      active
                        ? 'scale-110 stroke-[2.35px] text-slate-950'
                        : 'stroke-[1.75px] text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] tracking-tight leading-none mt-1 transition-colors',
                  active ? 'text-slate-950 font-semibold' : 'text-slate-500'
                )}
              >
                {item.label}
              </span>
              {active && (
                <span className="h-1 w-1 rounded-full bg-slate-950 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
