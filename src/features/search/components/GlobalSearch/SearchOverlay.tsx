'use client';

import React from 'react';
import { useSearchContext } from './SearchContext';

export function SearchOverlay({ isExpanded }: { isExpanded: boolean }) {
  const { isMobileModalOpen, setIsExpanded: setIsSearchExpanded } =
    useSearchContext();

  if (!isExpanded || isMobileModalOpen) return null;

  return (
    <div
      onClick={() => setIsSearchExpanded(false)}
      className="fixed inset-0 top-[176px] z-30 bg-black/25 transition-opacity duration-300 cursor-pointer"
      aria-hidden="true"
    />
  );
}
