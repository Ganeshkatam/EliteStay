'use client';

import { useHeaderState } from './useHeaderState';
import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/Container';
import { TopBar } from './TopBar';
import { useSearchContext } from '@/features/search/components/GlobalSearch/SearchContext';
import { type ExtendedProfile } from '@/types/profile';
import { type User } from '@supabase/supabase-js';

interface HeaderLayoutProps {
  user?: User | null;
  profile?: ExtendedProfile | null;
}

export function HeaderLayout({ user, profile }: HeaderLayoutProps) {
  const { variant, isExpanded: isHeaderExpanded } = useHeaderState();
  const { isExpanded: isSearchExpanded, setIsMobileModalOpen, isMobileModalOpen } = useSearchContext();

  const isExpanded = isHeaderExpanded || isSearchExpanded;

  // If Auth, we only show a minimal top bar (e.g., logo only)
  if (variant === 'auth') {
    return (
      <header className="sticky top-0 z-40 w-full bg-white border-b border-border/40">
        <Container>
          <div className="flex h-20 items-center justify-start">
            <TopBar variant="auth" />
          </div>
        </Container>
      </header>
    );
  }

  return (
    <>
      {/* Static placeholder prevents document flow jumps when the fixed header height animates */}
      <div className={variant === 'public-home' ? 'h-[176px]' : 'h-[76px]'} />

      <header
        className={cn(
          'fixed top-0 left-0 z-40 w-full transition-all duration-220 ease-in-out bg-white border-b border-border/40',
          // If expanded, the header height is 176px. If collapsed, 76px
          isExpanded ? 'h-[176px]' : 'h-[76px]'
        )}
      >
        <Container className="h-full">
          <div className="flex h-[76px] items-center justify-between gap-4 relative">
            <TopBar variant={variant} user={user} profile={profile} isExpanded={isExpanded} />
          </div>
        </Container>
      </header>
    </>
  );
}
