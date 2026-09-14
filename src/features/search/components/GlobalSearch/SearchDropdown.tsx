'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchContext } from './SearchContext';
import { cn } from '@/lib/utils';
import { Navigation, MapPin, Check } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isValid } from 'date-fns';
import { searchCitiesAction } from '@/features/location/actions/search-city';
import { type LocationCity } from '@/features/location/types';
import { useRouter } from 'next/navigation';
import { buildSearchUrl } from '@/features/search/lib/search-params';

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

const accommodationTypes = [
  { label: 'Any type', value: '' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'PG', value: 'pg' },
  { label: 'Hostel', value: 'hostel' },
  { label: 'Villa', value: 'villa' },
  { label: 'Co-Living', value: 'co-living' },
  { label: 'Private Room', value: 'private-room' },
];

export type StayDuration = '1 month' | '3 months' | '6 months' | '12+ months';

interface SearchDropdownProps {
  duration: StayDuration;
  setDuration: (dur: StayDuration) => void;
  popularCities: LocationCity[];
}

export function SearchDropdown({
  duration,
  setDuration,
  popularCities,
}: SearchDropdownProps) {
  const { state, updateState, activeSection, setActiveSection, setIsExpanded } =
    useSearchContext();
  const router = useRouter();

  // Location/Where states
  const [suggestions, setSuggestions] = useState<LocationCity[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Date states
  const [activeTab, setActiveTab] = useState<'dates' | 'flexible'>('dates');

  // Close active section when clicking outside the dropdown and search panel wrapper
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const searchContainer = document.querySelector('.search-container');
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchContainer &&
        !searchContainer.contains(event.target as Node)
      ) {
        setActiveSection(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setActiveSection]);

  const today = new Date();
  const currentMonth = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, []);
  const maxBookingMonth = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear() + 2, 11, 31);
  }, []);
  const todayStartOfDay = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const months = Array.from({ length: 6 }).map((_, i) => {
    return new Date(today.getFullYear(), today.getMonth() + i, 1);
  });

  // Update suggestions when input changes
  useEffect(() => {
    if (activeSection !== 'where') return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const val = state.city.trim();
    if (val.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        const results = await searchCitiesAction(val);
        setSuggestions(results || []);
      }, 300);
    } else {
      setTimeout(() => setSuggestions([]), 0);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [state.city, activeSection]);

  if (!activeSection) return null;

  // Selection handlers
  const handleCitySelect = (city: string) => {
    updateState({ city });
    setActiveSection(null);
  };

  const handleNearbyMe = () => {
    setActiveSection(null);
    setIsExpanded(false);
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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      updateState({ availableFrom: format(date, 'yyyy-MM-dd') });
      setActiveSection(null);
    } else {
      updateState({ availableFrom: '' });
    }
  };

  const handleMonthSelect = (date: Date) => {
    updateState({ availableFrom: format(date, 'yyyy-MM-01') });
  };

  const handleTypeSelect = (value: string) => {
    updateState({ type: value });
    setActiveSection(null);
  };

  const parsedDate = state.availableFrom
    ? parseISO(state.availableFrom)
    : undefined;
  const selectedDate =
    parsedDate && isValid(parsedDate) ? parsedDate : undefined;

  const selectedMonthIdx =
    selectedDate && selectedDate.getDate() === 1
      ? months.findIndex(
          (m) =>
            m.getMonth() === selectedDate.getMonth() &&
            m.getFullYear() === selectedDate.getFullYear()
        )
      : -1;

  const hasSuggestions =
    state.city.trim().length >= 2 && suggestions.length > 0;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute top-[115%] bg-white rounded-[32px] shadow-[0_8px_28px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 z-50 transition-all duration-300 ease-premium animate-in fade-in-0 zoom-in-95 duration-200 origin-top',
        activeSection === 'where' && 'left-0 translate-x-0 w-[420px] p-4',
        activeSection === 'dates' && 'left-1/2 -translate-x-1/2 w-[750px] p-6',
        activeSection === 'type' && 'left-full -translate-x-full w-[260px] p-3'
      )}
    >
      {/* 1. WHERE SECTION */}
      {activeSection === 'where' && (
        <div className="w-full">
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

      {/* 2. DATES SECTION */}
      {activeSection === 'dates' && (
        <div className="w-full">
          {/* Tab Selection */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('dates')}
                className={cn(
                  'px-6 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
                  activeTab === 'dates'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                Dates
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('flexible')}
                className={cn(
                  'px-6 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
                  activeTab === 'flexible'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                Flexible
              </button>
            </div>
          </div>

          {activeTab === 'dates' ? (
            <div className="flex justify-center w-full">
              <Calendar
                mode="single"
                numberOfMonths={2}
                captionLayout="label"
                startMonth={currentMonth}
                endMonth={maxBookingMonth}
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="w-full flex justify-center [--cell-size:2.65rem] gap-6"
                classNames={{
                  months: 'flex flex-row justify-center gap-10',
                  month: 'flex flex-col gap-3',
                  month_caption:
                    'flex h-[--cell-size] w-full items-center justify-center px-1 font-semibold text-sm',
                  weekdays: 'flex w-full justify-between mb-1',
                  weekday:
                    'text-muted-foreground flex-1 select-none rounded-md text-[0.75rem] font-medium text-center',
                  week: 'flex w-full justify-between mt-1',
                  day: 'group/day relative aspect-square h-[--cell-size] w-[--cell-size] select-none p-0 text-center flex items-center justify-center',
                }}
                disabled={(date) => date < todayStartOfDay}
              />
            </div>
          ) : (
            <div className="w-full py-1">
              <div className="text-center mb-8">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  How long would you like to stay?
                </h4>
                <div className="flex justify-center gap-3">
                  {(
                    ['1 month', '3 months', '6 months', '12+ months'] as const
                  ).map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={cn(
                        'px-5 py-2.5 rounded-full text-xs font-semibold border transition-all duration-200 whitespace-nowrap',
                        duration === dur
                          ? 'border-2 border-gray-900 bg-gray-50 text-gray-900 font-bold shadow-sm'
                          : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-900'
                      )}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  When do you want to go?
                </h4>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1 justify-center">
                  {months.map((m, idx) => {
                    const isSelected = selectedMonthIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleMonthSelect(m)}
                        className={cn(
                          'flex flex-col items-center justify-center min-w-[100px] h-[100px] rounded-2xl border transition-all duration-200 p-3',
                          isSelected
                            ? 'border-gray-900 bg-gray-50 text-gray-900 font-bold'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-900'
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className={cn(
                            'w-6 h-6 mb-1.5',
                            isSelected ? 'text-gray-900' : 'text-gray-400'
                          )}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                          />
                        </svg>
                        <span className="text-xs font-semibold">
                          {format(m, 'MMMM')}
                        </span>
                        <span className="text-[9px] text-gray-400 mt-0.5">
                          {format(m, 'yyyy')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TYPE SECTION */}
      {activeSection === 'type' && (
        <div className="w-full">
          <div className="space-y-1">
            {accommodationTypes.map((item) => {
              const isSelected = (state.type || '') === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleTypeSelect(item.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-sm font-medium transition-colors duration-150',
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <span>{item.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-white shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
