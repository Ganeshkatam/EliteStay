'use client';

import { useEffect, useRef } from 'react';
import { useHeaderState, HEADER_SCROLL } from './useHeaderState';
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

  // Ensure manual expansion turns off whenever the public header collapses on scroll
  useEffect(() => {
    if (
      (variant === 'public-home' || variant === 'public') &&
      !isHeaderExpanded &&
      isSearchExpanded
    ) {
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
          // Any intentional downward scroll (currentScrollY > lastScrollY) past threshold collapses search
          if (
            currentScrollY > HEADER_SCROLL.EXPAND_THRESHOLD &&
            currentScrollY > lastScrollY
          ) {
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
      <header className="sticky top-0 z-40 w-full bg-white border-b border-border/45">
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
      <div
        className={
          variant === 'public-home' || variant === 'public'
            ? 'h-[176px]'
            : 'h-[76px]'
        }
      />

      <header
        ref={headerRef}
        className="fixed top-0 left-0 z-40 w-full h-[76px] overflow-visible border-none bg-transparent"
      >
        {/* Glass Layer: GPU-accelerated height scaling */}
        <div
          className={cn(
            'absolute inset-x-0 top-0 h-[176px] bg-white/85 backdrop-blur-md origin-top motion-transform ease-premium border-b border-border/45',
            isExpanded ? 'scale-y-100' : 'scale-y-[0.4318]'
          )}
        />

        {/* Shadow Layer: Fades in only when collapsed and docked */}
        <div
          className={cn(
            'absolute inset-x-0 top-0 h-[76px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] motion-opacity ease-premium pointer-events-none',
            isExpanded ? 'opacity-0' : 'opacity-100'
          )}
        />

        <Container className="h-full relative z-10">
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
