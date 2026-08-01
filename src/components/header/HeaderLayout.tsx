'use client';

import { useEffect, useRef } from 'react';
import { useHeaderState } from './useHeaderState';
import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/Container';
import { TopBar } from './TopBar';
import { useSearchContext } from '@/features/search/components/GlobalSearch/SearchContext';
import { SearchOverlay } from '@/features/search/components/GlobalSearch/SearchOverlay';
import { type ExtendedProfile } from '@/types/profile';
import { type User } from '@supabase/supabase-js';

interface HeaderLayoutProps {
  user?: User | null;
  profile?: ExtendedProfile | null;
}

export function HeaderLayout({ user, profile }: HeaderLayoutProps) {
  const { variant, isExpanded: isHeaderExpanded } = useHeaderState();
  const { isExpanded: isSearchExpanded, setIsExpanded: setIsSearchExpanded } =
    useSearchContext();
  const headerRef = useRef<HTMLElement>(null);

  // Ensure manual expansion turns off whenever the home page header collapses on scroll
  useEffect(() => {
    if (variant === 'public-home' && !isHeaderExpanded && isSearchExpanded) {
      setIsSearchExpanded(false);
    }
  }, [variant, isHeaderExpanded, isSearchExpanded, setIsSearchExpanded]);

  // Collapse manual search expansion when scrolling down (ignores scroll-to-top animation)
  useEffect(() => {
    if (!isSearchExpanded) return;

    let ticking = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          // Any intentional downward scroll (currentScrollY > lastScrollY) past 40px collapses search
          if (currentScrollY > 40 && currentScrollY > lastScrollY) {
            setIsSearchExpanded(false);
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSearchExpanded, setIsSearchExpanded]);

  // Collapse manual search expansion on outside click or Escape key
  useEffect(() => {
    if (!isSearchExpanded) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchExpanded, setIsSearchExpanded]);

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
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 z-40 w-full transition-all duration-220 ease-in-out bg-white border-b border-border/40',
          // If expanded, the header height is 176px. If collapsed, 76px
          isExpanded ? 'h-[176px]' : 'h-[76px]'
        )}
      >
        <Container className="h-full">
          <div className="flex h-[76px] items-center justify-between gap-4 relative">
            <TopBar
              variant={variant}
              user={user}
              profile={profile}
              isExpanded={isExpanded}
            />
          </div>
        </Container>
      </header>

      <SearchOverlay isExpanded={isSearchExpanded} />
    </>
  );
}
