'use client';

import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchState {
  city: string;
  moveIn: string;
  type: string;
}

interface SearchContextValue {
  state: SearchState;
  updateState: (updates: Partial<SearchState>) => void;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  // Mobile overlay state
  isMobileModalOpen: boolean;
  setIsMobileModalOpen: (val: boolean) => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();

  // Derive initial state from URL params. useMemo ensures we only recompute when searchParams changes.
  const urlState = useMemo(
    () => ({
      city: searchParams?.get('city') || '',
      moveIn: searchParams?.get('availableFrom') || '',
      type: searchParams?.get('accommodationType') || '',
    }),
    [searchParams]
  );

  const [overrides, setOverrides] = useState<Partial<SearchState>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const state: SearchState = { ...urlState, ...overrides };

  const updateState = (updates: Partial<SearchState>) => {
    setOverrides((prev) => ({ ...prev, ...updates }));
  };

  return (
    <SearchContext.Provider
      value={{
        state,
        updateState,
        isExpanded,
        setIsExpanded,
        isMobileModalOpen,
        setIsMobileModalOpen,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}
