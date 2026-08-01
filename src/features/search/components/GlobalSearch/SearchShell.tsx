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
  const { isMobileModalOpen, setIsMobileModalOpen } = useSearchContext();

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
        "relative mx-auto bg-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] border border-gray-200 z-50 flex items-center w-full cursor-pointer md:cursor-default transition-all duration-250 ease-in-out",
        variant === 'hero' ? "max-w-[900px] h-[80px]" : "max-w-[440px] h-[48px]",
        variant === 'hero' && "shadow-[0_4px_24px_rgba(0,0,0,0.06)]",
        variant === 'minimal' && "max-w-[500px] h-[48px] shadow-sm hover:shadow-md"
      )}
    >
      <div className={cn(
        "flex items-center w-full h-full",
        variant === 'hero' ? "px-2" : "px-1"
      )}>
        {children}
      </div>
    </div>
  );
}
