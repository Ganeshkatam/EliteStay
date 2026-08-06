import React from 'react';
import { Wrench } from 'lucide-react';

export const MaintenanceWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <Wrench className="h-5 w-5 mr-2 text-indigo-500" />
          Maintenance
        </h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
          Request Repair
        </button>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <p className="text-sm text-gray-500">No active maintenance requests.</p>
      </div>
    </div>
  );
};
