'use client';

import React, { useState } from 'react';
import { LayoutGrid, Map, ArrowDownUp, Check, ChevronDown } from 'lucide-react';
import { useSearchData, useSearchUI } from '../../context/SearchProvider';
import { useSearchUrl } from '../../hooks/useSearchUrl';
import { SearchViewMode } from '../../types';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { type SearchFilters } from '../../lib/search-params';

const SORT_OPTIONS: { label: string; value: SearchFilters['sort'] }[] = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Distance', value: 'distance' },
];

export function ResultsActions() {
  const { filters } = useSearchData();
  const { viewMode, setViewMode } = useSearchUI();
  const { updateFilters } = useSearchUrl(filters);

  const [sortOpen, setSortOpen] = useState(false);

  const currentSort = filters.sort || 'recommended';
  const selectedSortObj = SORT_OPTIONS.find((o) => o.value === currentSort);

  const handleSortSelect = (val: SearchFilters['sort']) => {
    updateFilters({ sort: val });
    setSortOpen(false);
  };

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
      {/* Interactive Sort Dropdown */}
      <Popover open={sortOpen} onOpenChange={setSortOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:border-gray-900 hover:text-gray-900 transition-all duration-150 outline-none select-none shadow-sm">
            <ArrowDownUp className="w-3.5 h-3.5 text-gray-500" />
            <span>
              Sort:{' '}
              <strong className="font-semibold">
                {selectedSortObj?.label || 'Recommended'}
              </strong>
            </span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-gray-400 transition-transform',
                sortOpen ? 'rotate-180' : 'rotate-0'
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-52 p-1.5 rounded-2xl bg-white shadow-xl border border-gray-100 z-50"
        >
          <div className="space-y-0.5">
            {SORT_OPTIONS.map((item) => {
              const isSelected = currentSort === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleSortSelect(item.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-medium transition-colors duration-150',
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <span>{item.label}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* View Mode Switcher: Split (Map+Grid) vs Full Grid */}
      <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200 shadow-inner">
        <button
          onClick={() => setViewMode(SearchViewMode.SPLIT)}
          title="Split view with map"
          className={cn(
            'p-1.5 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-all duration-150',
            viewMode === SearchViewMode.SPLIT
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Map className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Map</span>
        </button>
        <button
          onClick={() => setViewMode(SearchViewMode.LIST)}
          title="Full grid view without map"
          className={cn(
            'p-1.5 px-2.5 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-all duration-150',
            viewMode === SearchViewMode.LIST
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Grid</span>
        </button>
      </div>
    </div>
  );
}
