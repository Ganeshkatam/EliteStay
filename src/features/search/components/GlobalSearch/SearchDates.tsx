'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchContext } from './SearchContext';
import { SearchSection } from './SearchSection';
import { type SearchVariant } from './types';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isValid } from 'date-fns';

interface SearchDatesProps {
  variant: SearchVariant;
}

export function SearchDates({ variant }: SearchDatesProps) {
  const { state, updateState } = useSearchContext();
  const isCompact = variant === 'compact';
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'dates' | 'flexible'>('dates');
  const [duration, setDuration] = useState<'weekend' | 'week' | 'month'>(
    'weekend'
  );
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const parsedDate = state.moveIn ? parseISO(state.moveIn) : undefined;
  const selectedDate =
    parsedDate && isValid(parsedDate) ? parsedDate : undefined;

  const displayValue = selectedDate
    ? selectedDate.getDate() === 1
      ? `${duration.charAt(0).toUpperCase() + duration.slice(1)} in ${format(selectedDate, 'MMM yyyy')}`
      : format(selectedDate, 'MMM dd, yyyy')
    : '';

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      updateState({ moveIn: format(date, 'yyyy-MM-dd') });
      setShowDropdown(false);
    } else {
      updateState({ moveIn: '' });
    }
  };

  const handleMonthSelect = (idx: number, date: Date) => {
    setSelectedMonthIdx(idx);
    updateState({ moveIn: format(date, 'yyyy-MM-01') });
  };

  const today = new Date();
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    return d;
  });

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div ref={containerRef} className="relative flex-1 flex">
      <SearchSection
        variant={variant}
        label="Move In"
        onClick={() => !isCompact && inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          id="moveIn"
          type="text"
          placeholder="Add dates"
          className={cn(
            'w-full bg-transparent p-0 placeholder-gray-500 focus:outline-none focus:ring-0 border-none outline-none transition-all duration-250 cursor-pointer',
            isCompact ? 'text-gray-900' : 'text-gray-900'
          )}
          value={displayValue}
          readOnly
          onFocus={() => !isCompact && setShowDropdown(true)}
          style={{ pointerEvents: isCompact ? 'none' : 'auto' }}
        />
      </SearchSection>

      {/* Dropdown */}
      {showDropdown && !isCompact && (
        <div className="absolute top-[120%] left-0 bg-white rounded-3xl shadow-[0_8px_28px_rgba(0,0,0,0.15)] border p-6 z-50 w-[750px]">
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
            <Calendar
              mode="single"
              numberOfMonths={2}
              captionLayout="dropdown"
              selected={selectedDate}
              onSelect={handleSelect}
              disabled={(date) => {
                // disable past dates
                const todayDate = new Date();
                todayDate.setHours(0, 0, 0, 0);
                return date < todayDate;
              }}
            />
          ) : (
            <div className="w-full py-1">
              <div className="text-center mb-8">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  How long would you like to stay?
                </h4>
                <div className="flex justify-center gap-3">
                  {(['weekend', 'week', 'month'] as const).map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={cn(
                        'px-6 py-2.5 rounded-full text-xs font-semibold border transition-all duration-200 capitalize',
                        duration === dur
                          ? 'border-gray-900 bg-gray-950 text-white font-bold'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-900'
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
                        onClick={() => handleMonthSelect(idx, m)}
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
    </div>
  );
}
