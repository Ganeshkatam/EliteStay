import React from 'react';
import { cn } from '@/lib/utils';
import { type SearchVariant } from './types';
import { useSearchContext } from './SearchContext';

interface SearchShellProps {
  variant: SearchVariant;
  children: React.ReactNode;
  onClick?: () => void;
}

export function SearchShell({ variant, children, onClick }: SearchShellProps) {
  const { setIsMobileModalOpen } = useSearchContext();

  const handleMobileClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileModalOpen(true);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleMobileClick}
      className={cn(
        'search-container relative mx-auto bg-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] border border-gray-200 z-50 flex items-center cursor-pointer md:cursor-default motion-layout ease-premium',
        variant === 'hero'
          ? 'search-shell-width h-[80px] shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
          : 'w-full max-w-[460px] min-w-0 h-[48px]',
        variant === 'minimal' &&
          'w-full max-w-[500px] min-w-0 h-[48px] shadow-sm hover:shadow-md'
      )}
    >
      <div
        className={cn(
          'flex items-center w-full h-full',
          variant === 'hero' ? 'px-2' : 'px-1'
        )}
      >
        {children}
      </div>
    </div>
  );
}
