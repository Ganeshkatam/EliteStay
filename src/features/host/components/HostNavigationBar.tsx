'use client';

import { usePathname } from 'next/navigation';
import { Logo } from '@/features/guest/discovery/shared/components/navigation/Logo';
import { UserMenu } from '@/features/guest/discovery/shared/components/navigation/UserMenu';
import { HostToggle } from '@/features/guest/discovery/shared/components/navigation/HostToggle';
import { type User } from '@supabase/supabase-js';
import { type ExtendedProfile } from '@/types/profile';

interface HostNavigationBarProps {
  user?: User | null;
  profile?: ExtendedProfile | null;
}

export function HostNavigationBar({ user, profile }: HostNavigationBarProps) {
  const pathname = usePathname();

  let headerTitle = 'Host Workspace';

  if (pathname.startsWith('/host/start')) {
    headerTitle = 'Host Programs';
  } else if (pathname.startsWith('/host/onboarding')) {
    headerTitle = 'Host Onboarding';
  } else if (pathname.startsWith('/host/profile')) {
    headerTitle = 'Host Profile';
  } else if (pathname.startsWith('/host/listings')) {
    headerTitle = 'Listings';
  } else if (pathname.startsWith('/host/calendar')) {
    headerTitle = 'Calendar';
  } else if (pathname.startsWith('/host/bookings')) {
    headerTitle = 'Bookings';
  } else if (pathname.startsWith('/host/stays')) {
    headerTitle = 'Stays';
  } else if (pathname === '/host') {
    headerTitle = 'Dashboard';
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="scale-90 origin-left">
            <Logo />
          </div>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <span className="text-sm font-semibold text-slate-700 hidden sm:block">
            {headerTitle}
          </span>
        </div>

        <div className="flex items-center justify-end space-x-3">
          {user && !pathname.startsWith('/host/onboarding') && (
            <HostToggle isHost={true} variant="host" />
          )}
          <UserMenu user={user} profile={profile} variant="host" />
        </div>
      </div>
    </header>
  );
}
