import { GuestNavigationBar } from '@/features/guest/discovery/shared/components/navigation/GuestNavigationBar';
import { GuestFooter } from '@/features/guest/discovery/shared/components/navigation/GuestFooter';
import { SearchProvider } from '@/features/search/components/GlobalSearch/SearchContext';
import { createClient } from '@/lib/supabase/server';
import { type ExtendedProfile } from '@/types/profile';

export default async function GuestLayout({
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
    <SearchProvider>
      <div className="flex flex-1 flex-col font-sans min-h-0">
        <GuestNavigationBar user={user} profile={profile} />
        <main className="flex-1 flex flex-col min-h-0">{children}</main>
        <GuestFooter />
      </div>
    </SearchProvider>
  );
}
