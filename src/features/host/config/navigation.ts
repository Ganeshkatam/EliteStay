import {
  LayoutDashboard,
  List,
  Inbox,
  Users,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface HostNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const HOST_NAVIGATION: HostNavItem[] = [
  { name: 'Dashboard', href: '/host', icon: LayoutDashboard },
  { name: 'Properties', href: '/host/listings', icon: List },
  { name: 'Applications', href: '/host/applications', icon: Inbox },
  { name: 'Residents', href: '/host/residents', icon: Users },
  { name: 'Settings', href: '/host/profile', icon: Settings },
];

export function getHostRouteTitle(pathname: string): string {
  if (pathname.startsWith('/host/start')) {
    return 'Host Programs';
  }
  if (pathname.startsWith('/host/onboarding')) {
    return 'Host Onboarding';
  }
  if (pathname.startsWith('/host/profile')) {
    return 'Host Profile';
  }
  if (pathname.startsWith('/host/listings')) {
    return 'Properties';
  }
  if (pathname.startsWith('/host/calendar')) {
    return 'Calendar';
  }
  if (pathname.startsWith('/host/bookings')) {
    return 'Bookings';
  }
  if (pathname.startsWith('/host/stays')) {
    return 'Stays';
  }
  if (pathname.startsWith('/host/applications')) {
    return 'Applications';
  }
  if (pathname.startsWith('/host/residents')) {
    return 'Residents';
  }
  if (pathname.startsWith('/host/leases')) {
    return 'Leases';
  }
  if (pathname === '/host') {
    return 'Dashboard';
  }
  return 'Host Workspace';
}
