'use client';

import { useSearchData } from '../../context/SearchProvider';

export function SearchRecovery() {
  const { recovery } = useSearchData();

  return (
    <div className="py-12 flex flex-col items-start w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">We couldn&apos;t find any matches</h2>
      <p className="text-gray-600 mb-8">Try adjusting your filters or searching in a different area.</p>

      {/* Basic Recovery Actions */}
      <div className="flex flex-col gap-8 w-full">
        {recovery.actions.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Suggested Actions</h3>
            <div className="flex flex-wrap gap-2">
              {recovery.actions.sort((a, b) => a.priority - b.priority).map((action, idx) => (
                <button key={idx} className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-gray-900 transition-colors">
                  {action.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {recovery.suggestedCities.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Popular Cities</h3>
            <div className="flex flex-wrap gap-2">
              {recovery.suggestedCities.map(city => (
                <button key={city} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-800 hover:bg-gray-200 transition-colors">
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
