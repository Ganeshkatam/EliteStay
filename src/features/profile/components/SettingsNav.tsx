'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import { Shield, Bell, Lock, Home, MessageSquare, Database } from 'lucide-react';

const navItems = [
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'hosting', label: 'Hosting', icon: Home },
  { id: 'communication', label: 'Communication', icon: MessageSquare },
  { id: 'data', label: 'Data & Privacy', icon: Database },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === `/users/settings/${item.id}`;
        return (
          <Link
            key={item.id}
            href={`/users/settings/${item.id}`}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-all duration-200 rounded-xl group",
              isActive
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-900 hover:bg-slate-100/80 border border-transparent"
            )}
          >
            <item.icon 
              strokeWidth={2.5}
              className={cn(
                "w-4 h-4 transition-colors",
                "text-slate-900"
              )} 
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
