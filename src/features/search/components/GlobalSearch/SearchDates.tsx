'use client';

import { useRef } from 'react';
import { useSearchContext } from './SearchContext';
import { SearchSection } from './SearchSection';
import { type SearchVariant } from './types';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';

interface SearchDatesProps {
  variant: SearchVariant;
  duration?: 'weekend' | 'week' | 'month';
}

export function SearchDates({ variant }: SearchDatesProps) {
  const { state, setActiveSection } = useSearchContext();
  const isCompact = variant === 'compact';
  const inputRef = useRef<HTMLInputElement>(null);

  const parsedDate = state.availableFrom
    ? parseISO(state.availableFrom)
    : undefined;
  const selectedDate =
    parsedDate && isValid(parsedDate) ? parsedDate : undefined;

  const displayValue = selectedDate
    ? selectedDate.getDate() === 1
      ? `From ${format(selectedDate, 'MMM yyyy')}`
      : `From ${format(selectedDate, 'MMM dd, yyyy')}`
    : '';

  return (
    <div className="relative flex-1 flex">
      <SearchSection
        variant={variant}
        label="Available From"
        onClick={() => {
          if (!isCompact) {
            setActiveSection('dates');
            inputRef.current?.focus();
          }
        }}
      >
        <input
          ref={inputRef}
          id="availableFrom"
          type="text"
          placeholder="Add date"
          className={cn(
            'w-full bg-transparent p-0 placeholder-gray-500 focus:outline-none focus:ring-0 border-none outline-none transition-all duration-250 cursor-pointer',
            isCompact ? 'text-gray-900' : 'text-gray-900'
          )}
          value={displayValue}
          readOnly
          onFocus={() => !isCompact && setActiveSection('dates')}
          style={{ pointerEvents: isCompact ? 'none' : 'auto' }}
        />
      </SearchSection>
    </div>
  );
}
