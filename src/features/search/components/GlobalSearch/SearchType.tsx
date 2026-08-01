'use client';

import { useSearchContext } from './SearchContext';
import { SearchSection } from './SearchSection';
import { type SearchVariant } from './types';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

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
  const { state, activeSection, setActiveSection } = useSearchContext();
  const isCompact = variant === 'compact';

  const selectedTypeObj = accommodationTypes.find(
    (t) => t.value === (state.type || '')
  );
  const displayValue =
    selectedTypeObj && selectedTypeObj.value !== ''
      ? selectedTypeObj.label
      : '';

  const isOpen = activeSection === 'type';

  return (
    <div className="relative flex-1 flex">
      <SearchSection
        variant={variant}
        label="Type"
        showDivider={false}
        onClick={() => !isCompact && setActiveSection(isOpen ? null : 'type')}
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
                isOpen ? 'rotate-180' : 'rotate-0'
              )}
            />
          )}
        </div>
      </SearchSection>
    </div>
  );
}
