'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchUrl } from '../hooks/useSearchUrl';
import { type SearchFilters, SEARCH_DEFAULTS } from '../lib/search-params';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { searchCitiesAction } from '@/features/location/actions/search-city';
import { LocationCity } from '@/features/location/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';

interface SearchFilterBarProps {
  filters: SearchFilters;
}

export function SearchFilterBar({ filters }: SearchFilterBarProps) {
  const { updateFilters, clearFilters, isPending } = useSearchUrl(filters);
  const [cityInput, setCityInput] = useState(filters.city || '');
  const [localFilters, setLocalFilters] = useState<Partial<SearchFilters>>({});
  const [suggestions, setSuggestions] = useState<LocationCity[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync city input if URL changes externally
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCityInput(filters.city || '');
  }, [filters.city]);

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    updateFilters({ city: cityInput.trim() || null });
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCityInput(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        const results = await searchCitiesAction(val.trim());
        setSuggestions(results);
        setShowSuggestions(true);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectCity = (cityName: string) => {
    setCityInput(cityName);
    setShowSuggestions(false);
    updateFilters({ city: cityName });
  };

  const handleSortChange = (val: string) => {
    updateFilters({ sort: val as SearchFilters['sort'] });
  };

  const handleAccTypeChange = (val: string) => {
    updateFilters({ accommodationType: val === 'all' ? null : val });
  };

  // For the More Filters Modal
  const openFiltersModal = () => {
    setLocalFilters({
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      billingPeriod: filters.billingPeriod,
      furnishing: filters.furnishing,
      genderPreference: filters.genderPreference,
      occupancyType: filters.occupancyType,
    });
  };

  const applyMoreFilters = () => {
    updateFilters(localFilters);
  };

  const handleLocalFilterChange = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      className={`w-full bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-4 mb-4 ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
    >
      <div className="flex flex-col md:flex-row gap-3">
        {/* City Search */}
        <form
          onSubmit={handleCitySearch}
          className="flex-1 relative flex items-center"
        >
          <MapPin className="absolute left-3 text-gray-400 h-5 w-5 z-10" />
          <Input
            type="text"
            placeholder="Search by city (e.g. Bangalore)"
            className="pl-10 pr-24 h-12 text-base rounded-lg border-gray-300 w-full focus-visible:ring-1 relative z-10 bg-transparent"
            value={cityInput}
            onChange={handleCityInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              // Delay hiding to allow click on suggestion
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          <div className="absolute inset-0 bg-white rounded-lg pointer-events-none" />
          
          <Button
            type="submit"
            size="sm"
            className="absolute right-1.5 h-9 rounded-md bg-slate-900 text-white hover:bg-slate-800 z-10"
          >
            <Search className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Search</span>
          </Button>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
              <ul className="py-1">
                {suggestions.map((city) => (
                  <li key={city.id}>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none flex items-center gap-2"
                      onClick={() => selectCity(city.name)}
                    >
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-slate-700">{city.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        <div className="flex gap-2">
          {/* Quick Filter: Accommodation Type */}
          <div className="w-1/2 md:w-48">
            <Select
              value={filters.accommodationType || 'all'}
              onValueChange={handleAccTypeChange}
            >
              <SelectTrigger className="h-12 w-full rounded-lg border-gray-300 focus:ring-1">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pg">PG</SelectItem>
                <SelectItem value="hostel">Hostel</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="independent-house">
                  Independent House
                </SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="w-1/2 md:w-48">
            <Select
              value={filters.sort || SEARCH_DEFAULTS.sort}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="h-12 w-full rounded-lg border-gray-300 focus:ring-1">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* More Filters Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="h-12 px-4 rounded-lg border-gray-300 text-gray-700 md:flex hidden"
                onClick={openFiltersModal}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </SheetTrigger>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-lg border-gray-300 text-gray-700 md:hidden flex shrink-0"
                onClick={openFiltersModal}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-md overflow-y-auto pb-20 sm:pb-6">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your search to find the perfect stay.
                </SheetDescription>
              </SheetHeader>

              <div className="py-6 flex flex-col gap-8">
                {/* Price Range */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium leading-none">
                    Price Range (₹)
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="grid gap-1.5 flex-1">
                      <Label
                        htmlFor="min-price"
                        className="text-xs text-gray-500"
                      >
                        Min Price
                      </Label>
                      <Input
                        id="min-price"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={localFilters.minPrice || ''}
                        onChange={(e) =>
                          handleLocalFilterChange(
                            'minPrice',
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </div>
                    <div className="text-gray-400 mt-5">-</div>
                    <div className="grid gap-1.5 flex-1">
                      <Label
                        htmlFor="max-price"
                        className="text-xs text-gray-500"
                      >
                        Max Price
                      </Label>
                      <Input
                        id="max-price"
                        type="number"
                        placeholder="Any"
                        min="0"
                        value={localFilters.maxPrice || ''}
                        onChange={(e) =>
                          handleLocalFilterChange(
                            'maxPrice',
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Period */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium leading-none">
                    Billing Period
                  </h3>
                  <Select
                    value={localFilters.billingPeriod || 'all'}
                    onValueChange={(val) =>
                      handleLocalFilterChange(
                        'billingPeriod',
                        val === 'all'
                          ? null
                          : (val as SearchFilters['billingPeriod'])
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="semester">Semester</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Furnishing */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium leading-none">
                    Furnishing
                  </h3>
                  <Select
                    value={localFilters.furnishing || 'all'}
                    onValueChange={(val) =>
                      handleLocalFilterChange(
                        'furnishing',
                        val === 'all'
                          ? null
                          : (val as SearchFilters['furnishing'])
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="fully_furnished">
                        Fully Furnished
                      </SelectItem>
                      <SelectItem value="semi_furnished">
                        Semi Furnished
                      </SelectItem>
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Preference */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium leading-none">
                    Gender Preference
                  </h3>
                  <Select
                    value={localFilters.genderPreference || 'all'}
                    onValueChange={(val) =>
                      handleLocalFilterChange(
                        'genderPreference',
                        val === 'all'
                          ? null
                          : (val as SearchFilters['genderPreference'])
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="male">Boys Only</SelectItem>
                      <SelectItem value="female">Girls Only</SelectItem>
                      <SelectItem value="any">Co-ed / Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Occupancy Type */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium leading-none">
                    Occupancy Type
                  </h3>
                  <Select
                    value={localFilters.occupancyType || 'all'}
                    onValueChange={(val) =>
                      handleLocalFilterChange(
                        'occupancyType',
                        val === 'all'
                          ? null
                          : (val as SearchFilters['occupancyType'])
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="private">Private Room</SelectItem>
                      <SelectItem value="shared">Shared Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 sm:static bg-white p-4 sm:p-0 border-t sm:border-t-0 border-gray-200">
                <SheetFooter className="flex-row sm:justify-end gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={() => {
                      setLocalFilters({});
                      clearFilters();
                    }}
                  >
                    Clear All
                  </Button>
                  <SheetClose asChild>
                    <Button
                      onClick={applyMoreFilters}
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Show Results
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
