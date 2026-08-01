'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchContext } from './SearchContext';
import { SearchSection } from './SearchSection';
import { type SearchVariant } from './types';
import { cn } from '@/lib/utils';
import { Navigation, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { buildSearchUrl } from '@/features/search/lib/search-params';
import {
  searchCitiesAction,
  getPopularCitiesAction,
} from '@/features/location/actions/search-city';
import { type LocationCity } from '@/features/location/types';

interface SearchWhereProps {
  variant: SearchVariant;
}

const cityColors = [
  'bg-rose-50 text-rose-500 border-rose-100',
  'bg-indigo-50 text-indigo-500 border-indigo-100',
  'bg-emerald-50 text-emerald-500 border-emerald-100',
  'bg-amber-50 text-amber-500 border-amber-100',
  'bg-sky-50 text-sky-500 border-sky-100',
];

function getCityDetails(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes('bangalore') || normalized.includes('bengaluru')) {
    return {
      title: 'Bengaluru, Karnataka',
      subtitle: 'For sights like Lalbagh Botanical Garden',
    };
  }
  if (normalized.includes('mumbai')) {
    return {
      title: 'Mumbai, Maharashtra',
      subtitle: 'Popular beach and Bollywood destination',
    };
  }
  if (normalized.includes('delhi')) {
    return {
      title: 'New Delhi, Delhi',
      subtitle: 'For historic monuments & rich culture',
    };
  }
  if (normalized.includes('pune')) {
    return {
      title: 'Pune, Maharashtra',
      subtitle: 'For pleasant weather & educational hubs',
    };
  }
  if (normalized.includes('hyderabad')) {
    return {
      title: 'Hyderabad, Telangana',
      subtitle: 'For its top-notch biryani & dining',
    };
  }
  return { title: `${name}, India`, subtitle: 'Popular destination' };
}

export function SearchWhere({ variant }: SearchWhereProps) {
  const { state, updateState, setIsExpanded } = useSearchContext();
  const isCompact = variant === 'compact';
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationCity[]>([]);
  const [popularCities, setPopularCities] = useState<LocationCity[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadCities() {
      try {
        const cities = await getPopularCitiesAction();
        setPopularCities(cities.slice(0, 5) as LocationCity[]);
      } catch (err) {
        console.error('Failed to load popular cities', err);
      }
    }
    loadCities();
  }, []);

  const handleCitySelect = (city: string) => {
    updateState({ city });
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateState({ city: val });

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        const results = await searchCitiesAction(val.trim());
        setSuggestions(results || []);
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  const handleNearbyMe = () => {
    setShowDropdown(false);
    setIsExpanded(false); // Close the global search if expanded
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const url = buildSearchUrl({
            centerLat: pos.coords.latitude,
            centerLng: pos.coords.longitude,
            sort: 'distance',
          });
          router.push(url);
        },
        (err) => {
          console.error('Could not get location', err);
          alert('Please allow location access to use this feature.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const hasSuggestions =
    state.city.trim().length >= 2 && suggestions.length > 0;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div ref={containerRef} className="relative flex-1 flex">
      <SearchSection
        variant={variant}
        label="Where"
        onClick={() => !isCompact && inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          id="where"
          type="text"
          placeholder="Search destinations"
          className={cn(
            'w-full truncate bg-transparent p-0 placeholder-gray-500 focus:outline-none focus:ring-0 border-none outline-none transition-all duration-250',
            isCompact ? 'text-gray-900' : 'text-gray-900'
          )}
          value={state.city}
          onChange={handleInputChange}
          onFocus={() => !isCompact && setShowDropdown(true)}
          readOnly={isCompact}
          style={{ pointerEvents: isCompact ? 'none' : 'auto' }}
        />
      </SearchSection>

      {/* Dropdown */}
      {showDropdown && !isCompact && (
        <div className="absolute top-[120%] left-0 w-[420px] bg-white rounded-3xl shadow-[0_8px_28px_rgba(0,0,0,0.15)] border p-4 z-50">
          <button
            type="button"
            onClick={handleNearbyMe}
            className="w-full flex items-center gap-4 p-3 hover:bg-gray-100 rounded-2xl transition-colors text-left"
          >
            <div className="w-12 h-12 flex-shrink-0 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl border border-blue-100">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">Nearby</div>
              <div className="text-xs text-gray-500">
                Find what&apos;s around you
              </div>
            </div>
          </button>

          <div className="mt-2 pt-2 border-t max-h-[360px] overflow-y-auto no-scrollbar">
            {hasSuggestions ? (
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-gray-900 mb-2 px-3">
                  Matching Destinations
                </h3>
                {suggestions.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleCitySelect(city.name)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors text-left"
                  >
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-700 text-sm">
                      {city.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                {popularCities.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 mb-2 px-3">
                      Suggested destinations
                    </h3>
                    <div className="space-y-1">
                      {popularCities.map((city, index) => {
                        const details = getCityDetails(city.name);
                        const colorClass =
                          cityColors[index % cityColors.length];
                        return (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => handleCitySelect(city.name)}
                            className="w-full flex items-center gap-4 p-3 hover:bg-gray-100 rounded-2xl transition-colors text-left"
                          >
                            <div
                              className={cn(
                                'w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl border',
                                colorClass
                              )}
                            >
                              <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {details.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {details.subtitle}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
