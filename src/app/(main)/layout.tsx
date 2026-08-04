import { GuestNavigationBar } from '@/features/guest/discovery/shared/components/navigation/GuestNavigationBar';
import { GuestFooter } from '@/features/guest/discovery/shared/components/navigation/GuestFooter';
import { SearchProvider } from '@/features/search/components/GlobalSearch/SearchContext';
import { createClient } from '@/lib/supabase/server';
import { type ExtendedProfile } from '@/types/profile';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // 1. Instantly parse the unverified user ID out of the local cookie string
  const authCookie = cookieStore.get(
    'sb-ybeidsnuijipacnmybfo-auth-token.0'
  )?.value;
  let potentialUserId: string | null = null;

  if (authCookie) {
    try {
      const decoded = jwtDecode<{ sub: string }>(authCookie);
      potentialUserId = decoded.sub; // Fast extraction without network requests
    } catch {
      /* Invalid token string ignored */
    }
  }

  // 2. Concurrently validate securely via API AND hit the database
  const [userResponse, profileResponse] = await Promise.all([
    supabase.auth.getUser(),
    potentialUserId
      ? supabase
          .from('profiles')
          .select('id, full_name, avatar_storage_path')
          .eq('id', potentialUserId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const user = userResponse.data.user;

  let profile =
    user && user.id === potentialUserId
      ? (profileResponse.data as ExtendedProfile | null)
      : null;

  // 4. Sequential fallback: If the fast cookie parse failed (e.g. cookie name mismatch), fetch now
  if (user && !profile) {
    const fallbackProfileResponse = await supabase
      .from('profiles')
      .select('id, full_name, avatar_storage_path')
      .eq('id', user.id)
      .maybeSingle();
    profile = fallbackProfileResponse.data as ExtendedProfile | null;
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
