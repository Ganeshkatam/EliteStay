'use client';

import React from 'react';
import { useSearchUI } from '../../context/SearchProvider';
import { Loader2 } from 'lucide-react';

interface MapControlsOverlayProps {
  searchAsMapMoves: boolean;
  setSearchAsMapMoves: (val: boolean) => void;
  viewportChanged: boolean;
  onSearchThisArea: () => void;
}

export function MapControlsOverlay({
  searchAsMapMoves,
  setSearchAsMapMoves,
  viewportChanged,
  onSearchThisArea,
}: MapControlsOverlayProps) {
  const { isSearching } = useSearchUI();

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none w-full max-w-xs px-4">
      {/* 1. Map Loading State Indicator */}
      {isSearching && (
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg border border-slate-700/80 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
          <span>Searching map area...</span>
        </div>
      )}

      {/* 2. Search This Area Button */}
      {viewportChanged && !searchAsMapMoves && !isSearching && (
        <button
          onClick={onSearchThisArea}
          className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-blue-500 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          Search this area
        </button>
      )}

      {/* 3. Search Preference Toggle Card */}
      <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg border border-slate-200/80 flex items-center gap-3">
        <label className="relative flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={searchAsMapMoves}
            onChange={(e) => setSearchAsMapMoves(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-2.5 text-xs font-semibold text-slate-700">
            Search as I move map
          </span>
        </label>
      </div>
    </div>
  );
}
