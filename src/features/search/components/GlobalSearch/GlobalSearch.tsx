'use client';

import React, { useState } from 'react';
import { useSearchContext } from './SearchContext';
import { SearchShell } from './SearchShell';
import { SearchModal } from './SearchModal';
import { SearchWhere } from './SearchWhere';
import { SearchDates } from './SearchDates';
import { SearchType } from './SearchType';
import { SearchButton } from './SearchButton';
import { SearchDropdown, type StayDuration } from './SearchDropdown';
import { type SearchVariant } from './types';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

import { type LocationCity } from '@/features/location/types';

interface GlobalSearchProps {
  variant: SearchVariant;
  popularCities?: LocationCity[];
}

export function GlobalSearch({
  variant,
  popularCities = [],
}: GlobalSearchProps) {
  const { state, setIsExpanded } = useSearchContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCompact = variant === 'compact';
  const [duration, setDuration] = useState<StayDuration>('1 month');

  const handleSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const params = new URLSearchParams();
    if (state.city.trim()) params.set('city', state.city.trim());
    if (state.availableFrom.trim())
      params.set('availableFrom', state.availableFrom.trim());
    if (state.type.trim()) params.set('accommodationType', state.type.trim());

    setIsExpanded(false);
    router.push(`/s?${params.toString()}`);
  };

  const handleShellClick = () => {
    if (variant === 'compact') {
      setIsExpanded(true);
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

  const parsedDate = state.availableFrom
    ? parseISO(state.availableFrom)
    : undefined;
  const dateSummary =
    parsedDate && isValid(parsedDate)
      ? format(parsedDate, 'dd MMM')
      : 'Any date';

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
              'absolute inset-y-0 left-0 right-0 flex items-center justify-start pl-3.5 pr-11 sm:pl-6 sm:pr-14 motion-opacity motion-transform ease-premium',
              isCompact
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none'
            )}
          >
            <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm font-medium text-gray-800 truncate">
              {/* Location (always visible) */}
              <span className="text-gray-900 font-semibold truncate">
                {citySummary}
              </span>

              {/* Date (visible on all screens) */}
              <span className="text-gray-300 inline">•</span>
              <span className="text-gray-500 font-normal truncate">
                {dateSummary}
              </span>

              {/* Type (visible on sm and up) */}
              <span className="text-gray-300 sm:inline hidden">•</span>
              <span className="text-gray-500 font-normal sm:inline hidden truncate">
                {typeSummary}
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

          <SearchDropdown
            duration={duration}
            setDuration={setDuration}
            popularCities={popularCities}
          />
        </div>
        <SearchButton variant={variant} onClick={handleSearch} />
      </SearchShell>
      <SearchModal />
    </>
  );
}
