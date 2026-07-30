import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { LayoutDashboard, List, CalendarDays, Inbox } from 'lucide-react';

export const metadata = {
  title: 'Host Dashboard - EliteStay',
};

const navigation = [
  { name: 'Dashboard', href: '/host', icon: LayoutDashboard },
  { name: 'My Listings', href: '/host/listings', icon: List },
  { name: 'Bookings', href: '/host/bookings', icon: Inbox },
  { name: 'Calendar', href: '/host/calendar', icon: CalendarDays },
];

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Optional: We could check if they have a 'host' role here, 
  // but for EliteStay V1, any user can become a host by creating a listing.

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-slate-50 md:block">
        <div className="flex h-full flex-col py-6">
          <div className="px-6 pb-4">
            <h2 className="text-lg font-semibold text-slate-900">Hosting</h2>
          </div>
          <nav className="flex-1 space-y-1 px-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <item.icon
                  className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-slate-500"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Nav could be placed here if needed, but for now we just show content */}
        {children}
      </main>
    </div>
  );
}
