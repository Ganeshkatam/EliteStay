'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useHeaderState, HEADER_SCROLL } from './useHeaderState';
import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/Container';
import { TopBar } from './TopBar';
import { useSearchContext } from '@/features/search/components/GlobalSearch/SearchContext';
import { SearchOverlay } from '@/features/search/components/GlobalSearch/SearchOverlay';
import { type ExtendedProfile } from '@/types/profile';
import { type User } from '@supabase/supabase-js';
import { parseSearchParams } from '@/features/search/lib/search-params';
import { SearchProvider } from '@/features/search/context/SearchProvider';
import { ToolbarRenderer } from '@/features/search/components/toolbar/ToolbarRenderer';
import { type SearchWorkspaceViewModel } from '@/features/search/types';

interface GuestNavigationBarProps {
  user?: User | null;
  profile?: ExtendedProfile | null;
}

export function GuestNavigationBar({ user, profile }: GuestNavigationBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSearchRoute = pathname === '/s';
  const { variant, isExpanded: isHeaderExpanded } = useHeaderState();
  const { isExpanded: isSearchExpanded, setIsExpanded: setIsSearchExpanded } =
    useSearchContext();
  const headerRef = useRef<HTMLElement>(null);

  // Parse filters from query parameters for the local SearchProvider
  const filters = parseSearchParams(
    searchParams ? Object.fromEntries(searchParams.entries()) : {}
  );

  const dummyViewModel: SearchWorkspaceViewModel = {
    filters,
    summary: { title: '', subtitle: '', total: 0, updatedAt: new Date() },
    results: {
      listings: [],
      pagination: { currentPage: 1, totalPages: 1, hasMore: false },
    },
    map: {},
    insights: {
      listingCount: 0,
      averageRent: 0,
      medianRent: 0,
      furnishedPercentage: 0,
      popularAreas: [],
      updatedAt: new Date(),
    },
    recovery: {
      nearbyLocalities: [],
      suggestedCities: [],
      popularSearches: [],
      actions: [],
    },
  };

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

  const headerHeightClass = isSearchRoute
    ? isExpanded
      ? 'h-[240px]'
      : 'h-[140px]'
    : isExpanded
      ? 'h-[176px]'
      : 'h-[76px]';

  return (
    <>
      {/* Static placeholder prevents document flow jumps when the fixed header height animates */}
      <div
        className={cn(
          isSearchRoute
            ? 'h-[140px]'
            : variant === 'public-home'
              ? 'h-[176px]'
              : 'h-[76px]'
        )}
      />

      <header
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 z-40 w-full overflow-visible border-none bg-transparent transition-all duration-300 ease-premium',
          headerHeightClass
        )}
      >
        {/* Glass Layer: GPU-accelerated height scaling */}
        <div
          className={cn(
            'absolute inset-x-0 top-0 bg-white/85 backdrop-blur-md border-b border-border/45 transition-all duration-300 ease-premium',
            headerHeightClass
          )}
        />

        {/* Shadow Layer: Fades in only when collapsed and docked */}
        <div
          className={cn(
            'absolute inset-x-0 top-0 h-[76px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] motion-opacity ease-premium pointer-events-none',
            isExpanded ? 'opacity-0' : 'opacity-100'
          )}
        />

        <div className="relative z-10 h-full flex flex-col justify-between">
          <Container className="flex h-[76px] items-center justify-between gap-4 relative py-0 px-4 md:px-8 xl:px-12 max-w-[1800px]">
            <TopBar
              variant={variant}
              user={user}
              profile={profile}
              isExpanded={isExpanded}
            />
          </Container>

          {/* Directly render the search filters toolbar as part of the header */}
          {isSearchRoute && (
            <SearchProvider viewModel={dummyViewModel}>
              <div className="h-16 flex items-center border-t border-gray-100/80 w-full">
                <Container className="h-full flex items-center py-0 px-4 md:px-8 xl:px-12 max-w-[1800px]">
                  <div className="w-full overflow-x-auto no-scrollbar">
                    <ToolbarRenderer />
                  </div>
                </Container>
              </div>
            </SearchProvider>
          )}
        </div>
      </header>

      <SearchOverlay isExpanded={isSearchExpanded} />
    </>
  );
}
