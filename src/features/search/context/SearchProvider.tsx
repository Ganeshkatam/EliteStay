'use client';

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useTransition,
} from 'react';
import { SearchWorkspaceViewModel, SearchViewMode } from '../types';

const VIEW_MODE_STORAGE_KEY = 'elitestay:search_view_mode';

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
export interface SearchUIState {
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
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  startSearchTransition: (callback: () => void) => void;
}

const SearchUIContext = createContext<SearchUIState | null>(null);

export function useSearchUI() {
  const context = useContext(SearchUIContext);
  if (!context) {
    throw new Error('useSearchUI must be used within a SearchProvider');
  }
  return context;
}

export function useSearchUIOptional() {
  return useContext(SearchUIContext);
}

// 3. Combined Provider Component
interface SearchProviderProps {
  viewModel: SearchWorkspaceViewModel;
  children: React.ReactNode;
}

export function SearchProvider({ viewModel, children }: SearchProviderProps) {
  // Read persisted viewMode preference from localStorage, default to SPLIT on desktop
  const [viewMode, setViewMode] = useState<SearchViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (
        saved === SearchViewMode.LIST ||
        saved === SearchViewMode.SPLIT ||
        saved === SearchViewMode.MAP
      ) {
        if (window.innerWidth < 1000) {
          return SearchViewMode.LIST;
        }
        return saved as SearchViewMode;
      }
    }
    return SearchViewMode.SPLIT;
  });

  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null
  );
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Transitions & Active Search Loading Animations State
  const [isPending, startTransition] = useTransition();
  const [prevViewModel, setPrevViewModel] = useState(viewModel);
  const [isManualSearching, setIsManualSearching] = useState(false);

  // Reset manual searching state when viewModel prop updates
  if (prevViewModel !== viewModel) {
    setPrevViewModel(viewModel);
    if (isManualSearching) {
      setIsManualSearching(false);
    }
  }

  const isSearching = isPending || isManualSearching;

  const startSearchTransition = useCallback(
    (callback: () => void) => {
      setIsManualSearching(true);
      startTransition(() => {
        callback();
      });
    },
    [startTransition]
  );

  // Adapt to screen size & restore user preference when screen is wide enough
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(min-width: 1000px)');
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (!e.matches) {
        setViewMode(SearchViewMode.LIST);
      } else {
        const saved = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
        if (
          saved === SearchViewMode.LIST ||
          saved === SearchViewMode.SPLIT ||
          saved === SearchViewMode.MAP
        ) {
          setViewMode(saved as SearchViewMode);
        }
      }
    };

    handleMediaChange(mediaQuery);
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const handleSetViewMode = useCallback((mode: SearchViewMode) => {
    if (
      typeof window !== 'undefined' &&
      window.innerWidth < 1000 &&
      mode !== SearchViewMode.LIST
    ) {
      return;
    }
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    }
  }, []);

  const uiState = useMemo<SearchUIState>(
    () => ({
      viewMode,
      setViewMode: handleSetViewMode,
      hoveredListingId,
      setHoveredListingId,
      selectedListingId,
      setSelectedListingId,
      selectedMarkerId,
      setSelectedMarkerId,
      drawerOpen,
      setDrawerOpen,
      isSearching,
      setIsSearching: setIsManualSearching,
      startSearchTransition,
    }),
    [
      viewMode,
      handleSetViewMode,
      hoveredListingId,
      selectedListingId,
      selectedMarkerId,
      drawerOpen,
      isSearching,
      startSearchTransition,
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
