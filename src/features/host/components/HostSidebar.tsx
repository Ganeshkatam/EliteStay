'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  List,
  CalendarDays,
  Inbox,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/host', icon: LayoutDashboard },
  { name: 'Listings', href: '/host/listings', icon: List },
  { name: 'Calendar', href: '/host/calendar', icon: CalendarDays },
  { name: 'Bookings', href: '/host/bookings', icon: Inbox },
  { name: 'Stays', href: '/host/stays', icon: Users },
];

export function HostSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-white md:block">
      <div className="flex h-full flex-col">
        {/* Sidebar Header */}
        <div className="px-6 py-6 pb-4">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 uppercase">
            Workspace
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/host' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-4 w-4 flex-shrink-0 transition-colors',
                    isActive
                      ? 'text-slate-900'
                      : 'text-slate-400 group-hover:text-slate-600'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Quick Actions */}
        <div className="p-4 border-t">
          <Link href="/host/listings/new" passHref legacyBehavior>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              New Listing
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
