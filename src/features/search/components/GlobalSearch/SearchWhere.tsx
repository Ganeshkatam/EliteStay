'use client';

import { useRef } from 'react';
import { useSearchContext } from './SearchContext';
import { SearchSection } from './SearchSection';
import { type SearchVariant } from './types';
import { cn } from '@/lib/utils';

interface SearchWhereProps {
  variant: SearchVariant;
}

export function SearchWhere({ variant }: SearchWhereProps) {
  const { state, updateState, setActiveSection } = useSearchContext();
  const isCompact = variant === 'compact';
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ city: e.target.value });
  };

  return (
    <div className="relative flex-1 flex">
      <SearchSection
        variant={variant}
        label="Where"
        onClick={() => {
          if (!isCompact) {
            setActiveSection('where');
            inputRef.current?.focus();
          }
        }}
      >
        <input
          ref={inputRef}
          id="where"
          type="text"
          placeholder="Search destinations"
          className={cn(
            'w-full truncate bg-transparent p-0 placeholder-gray-500 focus:outline-none focus:ring-0 border-none outline-none transition-all duration-250',
            isCompact ? 'text-gray-900' : 'text-gray-900'
          )}
          value={state.city}
          onChange={handleInputChange}
          onFocus={() => !isCompact && setActiveSection('where')}
          readOnly={isCompact}
          style={{ pointerEvents: isCompact ? 'none' : 'auto' }}
        />
      </SearchSection>
    </div>
  );
}
