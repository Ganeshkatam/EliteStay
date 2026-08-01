'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { SearchWorkspaceViewModel, SearchViewMode } from '../types';

// 1. Immutable Data Context
const SearchDataContext = createContext<SearchWorkspaceViewModel | null>(null);

export function useSearchData() {
  const context = useContext(SearchDataContext);
  if (!context) {
    throw new Error('useSearchData must be used within a SearchProvider');
  }
  return context;
}

// 2. Mutable UI State Context
interface SearchUIState {
  viewMode: SearchViewMode;
  setViewMode: (mode: SearchViewMode) => void;
  hoveredListingId: string | null;
  setHoveredListingId: (id: string | null) => void;
  selectedListingId: string | null;
  setSelectedListingId: (id: string | null) => void;
  selectedMarkerId: string | null;
  setSelectedMarkerId: (id: string | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const SearchUIContext = createContext<SearchUIState | null>(null);

export function useSearchUI() {
  const context = useContext(SearchUIContext);
  if (!context) {
    throw new Error('useSearchUI must be used within a SearchProvider');
  }
  return context;
}

// 3. Combined Provider Component
interface SearchProviderProps {
  viewModel: SearchWorkspaceViewModel;
  children: React.ReactNode;
}

export function SearchProvider({ viewModel, children }: SearchProviderProps) {
  // Default to SPLIT for desktop, but a responsive hook should eventually control this
  const [viewMode, setViewMode] = useState<SearchViewMode>(
    SearchViewMode.SPLIT
  );
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null
  );
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const uiState = useMemo<SearchUIState>(
    () => ({
      viewMode,
      setViewMode,
      hoveredListingId,
      setHoveredListingId,
      selectedListingId,
      setSelectedListingId,
      selectedMarkerId,
      setSelectedMarkerId,
      drawerOpen,
      setDrawerOpen,
    }),
    [
      viewMode,
      hoveredListingId,
      selectedListingId,
      selectedMarkerId,
      drawerOpen,
    ]
  );

  return (
    <SearchDataContext.Provider value={viewModel}>
      <SearchUIContext.Provider value={uiState}>
        {children}
      </SearchUIContext.Provider>
    </SearchDataContext.Provider>
  );
}
