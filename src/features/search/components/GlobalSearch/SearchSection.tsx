import React from 'react';
import { cn } from '@/lib/utils';
import { type SearchVariant } from './types';

interface SearchSectionProps {
  variant: SearchVariant;
  label: string;
  children: React.ReactNode;
  showDivider?: boolean;
}

export function SearchSection({ variant, label, children, showDivider = true }: SearchSectionProps) {
  const isCompact = variant === 'compact';

  return (
    <>
      <div className={cn(
        "flex-1 flex flex-col justify-center px-6 transition-all duration-250 cursor-pointer rounded-full hover:bg-gray-100 relative group",
        isCompact ? "h-[40px]" : "h-[64px]"
      )}>
        <label 
          className="text-xs font-bold uppercase tracking-wider text-gray-900 cursor-pointer"
        >
          {label}
        </label>
        <div className="w-full flex items-center text-sm">
          {children}
        </div>
      </div>

      {showDivider && (
        <div className={cn(
          "h-10 w-[1px] bg-gray-200 transition-transform duration-250 ease-in-out shrink-0 self-center origin-center",
          isCompact ? "scale-y-[0.6]" : "scale-y-100"
        )} />
      )}
    </>
  );
}
