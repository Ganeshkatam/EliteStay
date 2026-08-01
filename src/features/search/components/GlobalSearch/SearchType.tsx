'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchContext } from './SearchContext';
import { SearchSection } from './SearchSection';
import { type SearchVariant } from './types';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';

interface SearchTypeProps {
  variant: SearchVariant;
}

const accommodationTypes = [
  { label: 'Any type', value: '' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'PG', value: 'pg' },
  { label: 'Hostel', value: 'hostel' },
  { label: 'Villa', value: 'villa' },
  { label: 'Co-Living', value: 'co-living' },
  { label: 'Private Room', value: 'private-room' },
];

export function SearchType({ variant }: SearchTypeProps) {
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

  const selectedTypeObj = accommodationTypes.find(
    (t) => t.value === (state.type || '')
  );
  const displayValue =
    selectedTypeObj && selectedTypeObj.value !== ''
      ? selectedTypeObj.label
      : '';

  const handleSelect = (value: string) => {
    updateState({ type: value });
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1 flex">
      <SearchSection
        variant={variant}
        label="Type"
        showDivider={false}
        onClick={() => !isCompact && setShowDropdown((prev) => !prev)}
      >
        <div
          className={cn(
            'w-full flex items-center justify-between transition-all duration-250 cursor-pointer select-none',
            isCompact ? 'pointer-events-none' : 'pointer-events-auto'
          )}
        >
          <input
            id="type"
            type="text"
            placeholder="Any type"
            className={cn(
              'w-full bg-transparent p-0 placeholder-gray-500 focus:outline-none focus:ring-0 border-none outline-none transition-all duration-250 cursor-pointer truncate',
              displayValue ? 'text-gray-900 font-medium' : 'text-gray-900'
            )}
            value={displayValue}
            readOnly
            style={{ pointerEvents: 'none' }}
          />
          {!isCompact && (
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-500 shrink-0 ml-2 transition-transform duration-200',
                showDropdown ? 'rotate-180' : 'rotate-0'
              )}
            />
          )}
        </div>
      </SearchSection>

      {/* Dropdown Menu */}
      {showDropdown && !isCompact && (
        <div className="absolute top-[120%] right-0 w-[240px] bg-white rounded-3xl shadow-[0_8px_28px_rgba(0,0,0,0.15)] border p-3 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="space-y-1">
            {accommodationTypes.map((item) => {
              const isSelected = (state.type || '') === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleSelect(item.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-sm font-medium transition-colors duration-150',
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <span>{item.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-white shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
