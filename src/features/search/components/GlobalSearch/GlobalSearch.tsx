'use client';

import React, { useState } from 'react';
import { useSearchContext } from './SearchContext';
import { SearchShell } from './SearchShell';
import { SearchModal } from './SearchModal';
import { SearchWhere } from './SearchWhere';
import { SearchDates } from './SearchDates';
import { SearchType } from './SearchType';
import { SearchButton } from './SearchButton';
import { SearchDropdown } from './SearchDropdown';
import { type SearchVariant } from './types';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  variant: SearchVariant;
}

export function GlobalSearch({ variant }: GlobalSearchProps) {
  const { state, setIsExpanded } = useSearchContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCompact = variant === 'compact';
  const [duration, setDuration] = useState<'weekend' | 'week' | 'month'>(
    'weekend'
  );

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

  const paramLocality = searchParams ? searchParams.get('locality') : null;
  const paramCity = searchParams ? searchParams.get('city') : null;
  const hasViewport = searchParams && searchParams.get('minLat') != null;

  // Settle summary representations
  const citySummary = state.city
    ? state.city
    : paramLocality
      ? paramLocality
      : paramCity
        ? paramCity
        : hasViewport
          ? 'This map area'
          : 'Anywhere';

  const parsedDate = state.moveIn ? parseISO(state.moveIn) : undefined;
  const dateSummary =
    parsedDate && isValid(parsedDate)
      ? format(parsedDate, 'dd MMM')
      : 'Any week';

  const accommodationTypes = [
    { label: 'Any type', value: '' },
    { label: 'Apartment', value: 'apartment' },
    { label: 'PG', value: 'pg' },
    { label: 'Hostel', value: 'hostel' },
    { label: 'Villa', value: 'villa' },
    { label: 'Co-Living', value: 'co-living' },
    { label: 'Private Room', value: 'private-room' },
  ];
  const matchedType = accommodationTypes.find((t) => t.value === state.type);
  const typeSummary = matchedType ? matchedType.label : 'Any type';

  return (
    <>
      <SearchShell variant={variant} onClick={handleShellClick}>
        <div
          className={cn(
            'flex flex-1 items-center h-full relative',
            isCompact ? 'overflow-hidden' : 'overflow-visible'
          )}
        >
          {/* Compact Summary Panel */}
          <div
            className={cn(
              'absolute inset-y-0 left-0 right-0 flex items-center justify-start pl-6 pr-14 motion-opacity motion-transform ease-premium',
              isCompact
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none'
            )}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 truncate">
              {/* Location (always visible) */}
              <span className="text-gray-900">{citySummary}</span>

              {/* Type (hidden on mobile, visible on sm and up) */}
              <span className="text-gray-300 sm:inline hidden">•</span>
              <span className="text-gray-500 sm:inline hidden">
                {typeSummary}
              </span>

              {/* Date (hidden on mobile and tablet, visible on md and up) */}
              <span className="text-gray-300 md:inline hidden">•</span>
              <span className="text-gray-500 md:inline hidden">
                {dateSummary}
              </span>
            </div>
          </div>

          {/* Hero Input Group */}
          <div
            className={cn(
              'flex flex-1 items-center motion-opacity motion-transform ease-premium h-full w-full',
              isCompact
                ? 'opacity-0 scale-95 pointer-events-none'
                : 'opacity-100 scale-100 pointer-events-auto'
            )}
          >
            <SearchWhere variant={variant} />
            <SearchDates variant={variant} duration={duration} />
            <SearchType variant={variant} />
          </div>

          <SearchDropdown duration={duration} setDuration={setDuration} />
        </div>
        <SearchButton variant={variant} onClick={handleSearch} />
      </SearchShell>
      <SearchModal />
    </>
  );
}
