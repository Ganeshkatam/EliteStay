'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Heart, Bell, Settings, Home, Menu, ChevronLeft, MessageSquare, type LucideIcon } from 'lucide-react';

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
    ]
  },
  {
    title: 'Hosting',
    items: [
      { name: 'Host', href: '/host', icon: Home },
    ]
  }
];

export function MainPanel({ className }: { className?: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div 
      className={cn(
        "shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 relative sticky top-20 h-[calc(100vh-80px)]",
        isCollapsed ? "w-[72px]" : "w-[240px]",
        className
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 transition-colors z-10"
      >
        {isCollapsed ? <Menu className="h-4 w-4 text-slate-600" /> : <ChevronLeft className="h-4 w-4 text-slate-600" />}
      </button>

      <div className={cn("flex flex-col py-8 overflow-y-auto overflow-x-hidden", isCollapsed ? "px-2" : "px-6")}>
        <div className="flex flex-col gap-8">
          <nav className="flex flex-col w-full">
            {navGroups.map((group, groupIndex) => (
              <div key={group.title} className="flex flex-col w-full">
                {groupIndex > 0 && <div className={cn("h-px bg-slate-200 my-4", isCollapsed ? "mx-2" : "mx-0")} />}
                
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/users/profile' && pathname?.startsWith(item.href));

                    if (item.disabled) {
                      return (
                        <div
                          key={item.name}
                          className={cn(
                            "flex items-center rounded-lg text-sm font-bold text-slate-400 opacity-60 cursor-not-allowed",
                            isCollapsed ? "justify-center h-12 w-12 mx-auto" : "gap-3 px-3 h-10"
                          )}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <item.icon className="h-5 w-5 shrink-0" strokeWidth={2.5} />
                          {!isCollapsed && <span>{item.name}</span>}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'group flex items-center rounded-lg text-sm transition-all duration-200 relative',
                          isCollapsed ? "justify-center h-12 w-12 mx-auto" : "gap-3 px-3 h-10",
                          isActive
                            ? (isCollapsed ? 'bg-slate-100 text-slate-900' : 'text-slate-900 font-bold')
                            : 'text-slate-900 font-bold'
                        )}
                        title={isCollapsed ? item.name : undefined}
                      >
                        {isActive && !isCollapsed && (
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-slate-900" />
                        )}
                        <item.icon 
                          className={cn(
                            "shrink-0 transition-transform duration-200 text-slate-900", 
                            !isCollapsed && "group-hover:translate-x-0.5",
                            isCollapsed ? "h-6 w-6" : "h-5 w-5"
                          )} 
                          strokeWidth={2.5} 
                        />
                        {!isCollapsed && (
                          <span className="transition-transform duration-200 group-hover:translate-x-0.5 whitespace-nowrap">
                            {item.name}
                          </span>
                        )}
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
