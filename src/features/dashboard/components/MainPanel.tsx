'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Bell,
  Settings,
  Menu,
  ChevronLeft,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: 'Account',
    items: [
      { name: 'Profile', href: '/users/profile', icon: User },
      { name: 'Inbox', href: '/users/inbox', icon: MessageSquare },
      { name: 'Notifications', href: '/users/notifications', icon: Bell },
      { name: 'Settings', href: '/users/settings', icon: Settings },
    ],
  },
];

export function MainPanel({ className }: { className?: string }) {
  // null = responsive default (closed on mobile, open on desktop)
  const [isExpandedOverride, setIsExpandedOverride] = useState<boolean | null>(
    null
  );
  const pathname = usePathname();

  const handleToggle = () => {
    setIsExpandedOverride((prev) => {
      if (prev === null) {
        // If currently in default state, toggle based on current window width
        const isCurrentlyDesktop =
          typeof window !== 'undefined' && window.innerWidth >= 768;
        return !isCurrentlyDesktop;
      }
      return !prev;
    });
  };

  const isExplicitlyExpanded = isExpandedOverride === true;
  const isExplicitlyCollapsed = isExpandedOverride === false;

  return (
    <div
      className={cn(
        'shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 relative sticky top-[120px] md:top-[76px] h-[calc(100vh-120px)] md:h-[calc(100vh-76px)] z-30',
        isExplicitlyExpanded
          ? 'w-[240px]'
          : isExplicitlyCollapsed
            ? 'w-[54px] sm:w-[64px] md:w-[72px]'
            : 'w-[54px] sm:w-[64px] md:w-[240px]',
        className
      )}
    >
      <button
        onClick={handleToggle}
        aria-label="Toggle navigation sidebar"
        className="absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 transition-colors z-10"
      >
        {isExplicitlyExpanded ? (
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        ) : isExplicitlyCollapsed ? (
          <Menu className="h-4 w-4 text-slate-600" />
        ) : (
          <>
            <Menu className="h-4 w-4 text-slate-600 md:hidden" />
            <ChevronLeft className="h-4 w-4 text-slate-600 hidden md:block" />
          </>
        )}
      </button>

      <div
        className={cn(
          'flex flex-col py-8 overflow-y-auto overflow-x-hidden',
          isExplicitlyExpanded
            ? 'px-6'
            : isExplicitlyCollapsed
              ? 'px-1.5 sm:px-2'
              : 'px-1.5 sm:px-2 md:px-6'
        )}
      >
        <div className="flex flex-col gap-8">
          <nav className="flex flex-col w-full">
            {navGroups.map((group, groupIndex) => (
              <div key={group.title} className="flex flex-col w-full">
                {groupIndex > 0 && (
                  <div
                    className={cn(
                      'h-px bg-slate-200 my-4',
                      isExplicitlyExpanded
                        ? 'mx-0'
                        : isExplicitlyCollapsed
                          ? 'mx-2'
                          : 'mx-2 md:mx-0'
                    )}
                  />
                )}

                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/users/profile' &&
                        pathname?.startsWith(item.href));

                    if (item.disabled) {
                      return (
                        <div
                          key={item.name}
                          className={cn(
                            'flex items-center rounded-lg text-sm font-bold text-slate-400 opacity-60 cursor-not-allowed',
                            isExplicitlyExpanded
                              ? 'gap-3 px-3 h-10'
                              : isExplicitlyCollapsed
                                ? 'justify-center h-10 w-10 sm:h-12 sm:w-12 mx-auto'
                                : 'justify-center h-10 w-10 sm:h-12 sm:w-12 mx-auto md:justify-start md:h-10 md:w-auto md:gap-3 md:px-3'
                          )}
                          title={item.name}
                        >
                          <item.icon
                            className="h-5 w-5 shrink-0"
                            strokeWidth={2.5}
                          />
                          <span
                            className={cn(
                              isExplicitlyExpanded
                                ? 'inline'
                                : isExplicitlyCollapsed
                                  ? 'hidden'
                                  : 'hidden md:inline'
                            )}
                          >
                            {item.name}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'group flex items-center rounded-lg text-sm transition-all duration-200 relative',
                          isExplicitlyExpanded
                            ? 'gap-3 px-3 h-10'
                            : isExplicitlyCollapsed
                              ? 'justify-center h-10 w-10 sm:h-12 sm:w-12 mx-auto'
                              : 'justify-center h-10 w-10 sm:h-12 sm:w-12 mx-auto md:justify-start md:h-10 md:w-auto md:gap-3 md:px-3',
                          isActive
                            ? 'bg-slate-100 md:bg-transparent text-slate-900 font-bold'
                            : 'text-slate-900 font-bold hover:bg-slate-50'
                        )}
                        title={item.name}
                      >
                        {isActive && (
                          <div
                            className={cn(
                              'absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-slate-900',
                              isExplicitlyExpanded
                                ? 'block'
                                : isExplicitlyCollapsed
                                  ? 'hidden'
                                  : 'hidden md:block'
                            )}
                          />
                        )}
                        <item.icon
                          className={cn(
                            'shrink-0 transition-transform duration-200 text-slate-900',
                            isExplicitlyExpanded
                              ? 'h-5 w-5 group-hover:translate-x-0.5'
                              : isExplicitlyCollapsed
                                ? 'h-5 w-5 sm:h-6 sm:w-6'
                                : 'h-5 w-5 sm:h-6 sm:w-6 md:h-5 md:w-5 md:group-hover:translate-x-0.5'
                          )}
                          strokeWidth={2.5}
                        />
                        <span
                          className={cn(
                            'transition-transform duration-200 whitespace-nowrap',
                            isExplicitlyExpanded
                              ? 'inline group-hover:translate-x-0.5'
                              : isExplicitlyCollapsed
                                ? 'hidden'
                                : 'hidden md:inline md:group-hover:translate-x-0.5'
                          )}
                        >
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
