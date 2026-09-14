'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { HOST_NAVIGATION, getHostRouteTitle } from '../config/navigation';
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
  const headerTitle = getHostRouteTitle(pathname);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 shrink-0 md:hidden"
                aria-label="Open host workspace navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(85vw,320px)] p-0">
              <SheetHeader className="border-b px-5 py-5 text-left">
                <SheetTitle>Host Workspace</SheetTitle>
              </SheetHeader>
              <nav
                className="flex flex-col gap-1 p-3"
                aria-label="Host workspace navigation"
              >
                {HOST_NAVIGATION.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/host' && pathname.startsWith(item.href));

                  return (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                      >
                        <item.icon
                          className={`h-5 w-5 shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="scale-90 origin-left shrink-0">
            <Logo />
          </div>
          <div className="hidden h-5 w-px bg-slate-200 sm:block" />
          <span className="truncate text-sm font-semibold text-slate-700 sm:block">
            {headerTitle}
          </span>
        </div>

        <div className="flex shrink-0 items-center justify-end space-x-1.5 sm:space-x-3">
          {user && !pathname.startsWith('/host/onboarding') && (
            <HostToggle isHost={true} variant="host" />
          )}
          <UserMenu user={user} profile={profile} variant="host" />
        </div>
      </div>
    </header>
  );
}
