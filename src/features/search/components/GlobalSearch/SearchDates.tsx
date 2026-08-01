'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchContext } from './SearchContext';
import { SearchSection } from './SearchSection';
import { type SearchVariant } from './types';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isValid } from 'date-fns';

interface SearchDatesProps {
  variant: SearchVariant;
}

export function SearchDates({ variant }: SearchDatesProps) {
  const { state, updateState } = useSearchContext();
  const isCompact = variant === 'compact';
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parsedDate = state.moveIn ? parseISO(state.moveIn) : undefined;
  const selectedDate =
    parsedDate && isValid(parsedDate) ? parsedDate : undefined;

  const displayValue = selectedDate ? format(selectedDate, 'MM dd yyyy') : '';

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      updateState({ moveIn: format(date, 'yyyy-MM-dd') });
      setShowDropdown(false);
    } else {
      updateState({ moveIn: '' });
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div ref={containerRef} className="relative flex-1 flex">
      <SearchSection
        variant={variant}
        label="Move In"
        onClick={() => !isCompact && inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          id="moveIn"
          type="text"
          placeholder="Add dates"
          className={cn(
            'w-full bg-transparent p-0 placeholder-gray-500 focus:outline-none focus:ring-0 border-none outline-none transition-all duration-250 cursor-pointer',
            isCompact ? 'text-gray-900' : 'text-gray-900'
          )}
          value={displayValue}
          readOnly
          onFocus={() => !isCompact && setShowDropdown(true)}
          style={{ pointerEvents: isCompact ? 'none' : 'auto' }}
        />
      </SearchSection>

      {/* Dropdown */}
      {showDropdown && !isCompact && (
        <div className="absolute top-[120%] left-0 bg-white rounded-3xl shadow-[0_8px_28px_rgba(0,0,0,0.15)] border p-4 z-50">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={(date) => {
              // disable past dates
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
          />
        </div>
      )}
    </div>
  );
}
