'use client';

import React from 'react';
import { useSearchContext } from './SearchContext';
import { SearchShell } from './SearchShell';
import { SearchModal } from './SearchModal';
import { SearchWhere } from './SearchWhere';
import { SearchDates } from './SearchDates';
import { SearchType } from './SearchType';
import { SearchButton } from './SearchButton';
import { type SearchVariant } from './types';
import { useRouter } from 'next/navigation';

interface GlobalSearchProps {
  variant: SearchVariant;
}

export function GlobalSearch({ variant }: GlobalSearchProps) {
  const { state, setIsExpanded } = useSearchContext();
  const router = useRouter();

  const handleSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const params = new URLSearchParams();
    if (state.city.trim()) params.set('city', state.city.trim());
    if (state.moveIn.trim()) params.set('availableFrom', state.moveIn.trim());
    if (state.type.trim()) params.set('accommodationType', state.type.trim());
    
    setIsExpanded(false);
    router.push(`/s?${params.toString()}`);
  };

  const handleShellClick = () => {
    if (variant === 'compact') {
      setIsExpanded(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isEmpty = !state.city && !state.moveIn && !state.type;
  const isCompact = variant === 'compact';

  return (
    <>
      <SearchShell variant={variant} onClick={handleShellClick}>
        <div className="flex flex-1 items-center">
          <SearchWhere variant={variant} />
          <SearchDates variant={variant} />
          <SearchType variant={variant} />
        </div>
        <SearchButton variant={variant} onClick={handleSearch} />
      </SearchShell>
      <SearchModal />
    </>
  );
}
