import { HostNavigationBar } from '@/features/host/components/HostNavigationBar';
import { createClient } from '@/lib/supabase/server';
import { type ExtendedProfile } from '@/types/profile';

export const metadata = {
  title: 'Host - EliteStay',
};

/**
 * Minimal root host layout. No sidebar, no auth check here.
 * Authorization is enforced by nested route group layouts:
 *   (operational)/layout.tsx  -> requireOperationalHost()
 *   (host-profile)/layout.tsx -> requireHostProfile()
 * Top-level pages (start, onboarding, suspended) have their own access logic.
 */
export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: ExtendedProfile | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_storage_path')
      .eq('id', user.id)
      .maybeSingle();
    profile = data as ExtendedProfile | null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HostNavigationBar user={user} profile={profile} />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
