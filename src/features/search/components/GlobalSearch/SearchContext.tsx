'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
  
  const [state, setState] = useState<SearchState>({
    city: searchParams?.get('city') || '',
    moveIn: searchParams?.get('availableFrom') || '',
    type: searchParams?.get('accommodationType') || '',
  });

  // Sync state when URL changes (e.g. going back/forward or new searches)
  useEffect(() => {
    setState({
      city: searchParams?.get('city') || '',
      moveIn: searchParams?.get('availableFrom') || '',
      type: searchParams?.get('accommodationType') || '',
    });
  }, [searchParams]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const updateState = (updates: Partial<SearchState>) => {
    setState((prev) => ({ ...prev, ...updates }));
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
