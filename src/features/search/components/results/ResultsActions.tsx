'use client';

import { Heart, LayoutGrid, List, ArrowDownUp } from 'lucide-react';
import { useSearchUI } from '../../context/SearchProvider';
import { SearchViewMode } from '../../types';

export function ResultsActions() {
  const { viewMode, setViewMode } = useSearchUI();

  return (
    <div className="flex items-center gap-3">
      <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
        <ArrowDownUp className="w-4 h-4" />
        Sort
      </button>

      <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200 hidden sm:flex">
        <button 
          onClick={() => setViewMode(SearchViewMode.SPLIT)}
          className={`p-1.5 rounded-full transition-colors ${viewMode === SearchViewMode.SPLIT ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setViewMode(SearchViewMode.LIST)}
          className={`p-1.5 rounded-full transition-colors ${viewMode === SearchViewMode.LIST ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
        <Heart className="w-4 h-4" />
        Save
      </button>
    </div>
  );
}
