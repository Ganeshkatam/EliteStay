'use client';

import React, { useEffect, useState } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { ChevronDown, Navigation, MapPin } from 'lucide-react';
import { useSearchData } from '../../context/SearchProvider';
import { useSearchUrl } from '../../hooks/useSearchUrl';
import { getPopularCitiesAction } from '@/features/location/actions/search-city';
import { cn } from '@/lib/utils';

interface PopularCity {
  id: string;
  name: string;
}

export function WhereDropdown() {
  const { filters } = useSearchData();
  const { updateFilters } = useSearchUrl(filters);
  const [open, setOpen] = useState(false);
  const [popularCities, setPopularCities] = useState<PopularCity[]>([]);

  useEffect(() => {
    async function loadCities() {
      try {
        const cities = await getPopularCitiesAction();
        // Limit to top 5
        setPopularCities(cities.slice(0, 5) as PopularCity[]);
      } catch (err) {
        console.error('Failed to load popular cities', err);
      }
    }
    loadCities();
  }, []);

  const selectedCity = filters.city;
  const label = selectedCity ? selectedCity : 'Where';
  const active = !!selectedCity;

  const handleCitySelect = (cityName: string) => {
    if (selectedCity === cityName) {
      updateFilters({ city: null });
    } else {
      updateFilters({ city: cityName });
    }
    setOpen(false);
  };

  const handleNearbyMe = () => {
    setOpen(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateFilters({
            centerLat: pos.coords.latitude,
            centerLng: pos.coords.longitude,
            sort: 'distance',
          });
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all duration-200 select-none outline-none',
            active
              ? 'border-gray-900 bg-gray-50 text-gray-900 font-semibold'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900'
          )}
        >
          <span>{label}</span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-gray-500 transition-transform duration-200',
              open ? 'rotate-180' : 'rotate-0'
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[280px] p-3 rounded-2xl bg-white shadow-lg border border-gray-100 z-50"
      >
        <button
          type="button"
          onClick={handleNearbyMe}
          className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-left"
        >
          <div className="w-9 h-9 flex-shrink-0 bg-gray-50 flex items-center justify-center rounded-lg border border-gray-100">
            <Navigation className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-xs">Nearby me</div>
            <div className="text-[10px] text-gray-500">
              Find places near your location
            </div>
          </div>
        </button>

        {popularCities.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-2">
              Popular Cities
            </h3>
            <div className="space-y-0.5">
              {popularCities.map((city) => {
                const isSelected = selectedCity === city.name;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleCitySelect(city.name)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-semibold transition-colors duration-150',
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <MapPin
                      className={cn(
                        'h-3.5 w-3.5',
                        isSelected ? 'text-white' : 'text-gray-400'
                      )}
                    />
                    <span>{city.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
