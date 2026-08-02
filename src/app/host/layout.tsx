import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HostSidebar } from '@/features/host/components/HostSidebar';

export const metadata = {
  title: 'Host Workspace - EliteStay',
};

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

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <HostSidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
    </div>
  );
}
