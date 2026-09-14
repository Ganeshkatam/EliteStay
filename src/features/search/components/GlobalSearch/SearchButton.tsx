import React from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { type SearchVariant } from './types';

interface SearchButtonProps {
  variant: SearchVariant;
  onClick: (e: React.MouseEvent) => void;
}

export function SearchButton({ variant, onClick }: SearchButtonProps) {
  const isCompact = variant === 'compact';

  return (
    <div className="pl-2 pr-2 shrink-0 self-center">
      <button
        type="button"
        onClick={onClick}
        aria-label="Search"
        className={cn(
          'bg-slate-900 hover:bg-slate-800 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-180 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
          isCompact ? 'h-10 w-10' : 'h-14 w-14'
        )}
      >
        <Search
          className={cn(
            'transition-all duration-180',
            isCompact ? 'h-4 w-4' : 'h-6 w-6'
          )}
        />
      </button>
    </div>
  );
}
