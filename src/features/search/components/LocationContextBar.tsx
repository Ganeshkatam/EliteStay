'use client';

import { useSearchData } from '../context/SearchProvider';

export function LocationContextBar() {
  const { summary, insights } = useSearchData();

  // State mapping will depend on how we resolve city -> state in V1
  const stateName = 'Karnataka';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">
          {summary.title}, {stateName}
        </span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-600">{summary.total} stays</span>
      </div>
      <div className="hidden md:flex items-center gap-4 text-gray-600">
        <span>Average ₹{insights.averageRent.toLocaleString()}/month</span>
        <span className="text-gray-400">•</span>
        <span>Popular in {insights.popularAreas.join(' • ')}</span>
      </div>
    </div>
  );
}
