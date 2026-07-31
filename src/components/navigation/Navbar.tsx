// src/components/navigation/Navbar.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Logo } from './Logo';
import { SearchTrigger } from './SearchTrigger';
import { UserMenu } from './UserMenu';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/utils';
import { type ExtendedProfile } from '@/features/auth/components/ProfileForm';

/**
 * Server‑rendered navigation bar.
 * Retrieves the current Supabase user and their profile (including the optional
 * `avatar_path` legacy field) and renders Logo, SearchTrigger, and UserMenu.
 */
export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: ExtendedProfile | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      // Pull both the new column (avatar_url) and the legacy column (avatar_path)
      .select('id, full_name, avatar_url, avatar_path')
      .eq('id', user.id)
      .single();
    // `data` may be undefined if the row is missing; guard against that.
    profile = data as ExtendedProfile | null;
  }

  return (
    <header
      className={cn(
        'sticky top-0 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'z-[1100]' // Matches DESIGN.zIndex.sticky
      )}
    >
      <Container>
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex flex-1 items-center justify-start">
            <Logo />
          </div>

          <div className="flex flex-1 items-center justify-center">
            <SearchTrigger />
          </div>

          <div className="flex flex-1 items-center justify-end space-x-4">
            {user ? (
              <>
                <Link href="/host/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary hidden md:block">
                  Switch to hosting
                </Link>
                <NotificationBell />
                <UserMenu user={user} profile={profile} />
              </>
            ) : (
              <UserMenu user={user} profile={profile} />
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
