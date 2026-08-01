'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchContext } from './SearchContext';
import { SearchSection } from './SearchSection';
import { type SearchVariant } from './types';
import { cn } from '@/lib/utils';
import { MapPin, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { buildSearchUrl } from '@/features/search/lib/search-params';

interface SearchWhereProps {
  variant: SearchVariant;
}

export function SearchWhere({ variant }: SearchWhereProps) {
  const { state, updateState, setIsExpanded } = useSearchContext();
  const isCompact = variant === 'compact';
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city: string) => {
    updateState({ city });
    setShowDropdown(false);
  };

  const handleNearbyMe = () => {
    setShowDropdown(false);
    setIsExpanded(false); // Close the global search if expanded
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const url = buildSearchUrl({
          centerLat: pos.coords.latitude,
          centerLng: pos.coords.longitude,
          sort: 'distance',
        });
        router.push(url);
      }, (err) => {
        console.error("Could not get location", err);
        alert("Please allow location access to use this feature.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const popularCities = [
    { name: 'Bangalore', gradient: 'from-blue-500 to-indigo-600' },
    { name: 'Mumbai', gradient: 'from-orange-400 to-rose-500' },
    { name: 'Delhi', gradient: 'from-emerald-400 to-teal-600' },
    { name: 'Pune', gradient: 'from-purple-500 to-pink-600' },
    { name: 'Hyderabad', gradient: 'from-amber-400 to-orange-500' },
    { name: 'Chennai', gradient: 'from-cyan-400 to-blue-600' },
  ];

  return (
    <div ref={containerRef} className="relative flex-1 flex">
      <SearchSection variant={variant} label="Where">
        <input
          id="where"
          type="text"
          placeholder="Search destinations"
          className={cn(
            "w-full truncate bg-transparent p-0 placeholder-gray-500 focus:outline-none focus:ring-0 border-none outline-none transition-all duration-250",
            isCompact ? "text-gray-900" : "text-gray-900"
          )}
          value={state.city}
          onChange={(e) => updateState({ city: e.target.value })}
          onFocus={() => !isCompact && setShowDropdown(true)}
          readOnly={isCompact}
          style={{ pointerEvents: isCompact ? 'none' : 'auto' }}
        />
      </SearchSection>

      {/* Dropdown */}
      {showDropdown && !isCompact && (
        <div className="absolute top-[120%] left-0 w-[400px] bg-white rounded-3xl shadow-[0_8px_28px_rgba(0,0,0,0.15)] border p-4 z-50">
          
          <button 
            type="button"
            onClick={handleNearbyMe}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-2xl transition-colors text-left"
          >
            <div className="w-12 h-12 flex-shrink-0 bg-gray-100 flex items-center justify-center rounded-xl border">
              <Navigation className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Nearby me</div>
              <div className="text-sm text-gray-500">Find places near your location</div>
            </div>
          </button>

          <div className="mt-4 pt-4 border-t">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 px-2">
              Popular Cities
            </h3>
            <div className="grid grid-cols-3 gap-3 px-1">
              {popularCities.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => handleCitySelect(city.name)}
                  className="group relative h-24 overflow-hidden rounded-xl flex items-end p-3 border hover:border-gray-900 transition-colors"
                >
                  <div className={`absolute inset-0 z-0 bg-gradient-to-br ${city.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative z-10 text-white font-medium text-sm tracking-wide text-shadow-sm">
                    {city.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
