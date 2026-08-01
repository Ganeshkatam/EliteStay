'use client';

import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchContext } from './SearchContext';
import { SearchWhere } from './SearchWhere';
import { SearchDates } from './SearchDates';
import { SearchType } from './SearchType';

export function SearchModal() {
  const router = useRouter();
  const { state, setIsExpanded, isMobileModalOpen, setIsMobileModalOpen } = useSearchContext();

  if (!isMobileModalOpen) return null;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (state.city.trim()) params.set('city', state.city.trim());
    if (state.moveIn.trim()) params.set('availableFrom', state.moveIn.trim());
    if (state.type.trim()) params.set('accommodationType', state.type.trim());
    
    setIsMobileModalOpen(false);
    setIsExpanded(false);
    router.push(`/s?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col md:hidden animate-in slide-in-from-bottom-full duration-300">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => setIsMobileModalOpen(false)}>
          <X className="h-6 w-6" />
        </Button>
        <span className="font-semibold text-lg">Search</span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <SearchWhere variant="hero" />
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
          <SearchDates variant="hero" />
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <SearchType variant="hero" />
        </div>
      </div>

      <div className="p-4 border-t bg-white">
        <Button 
          onClick={handleSearch}
          className="w-full h-14 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center"
        >
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </div>
    </div>
  );
}
