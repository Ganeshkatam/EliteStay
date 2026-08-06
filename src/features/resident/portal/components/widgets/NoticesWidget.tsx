import React from 'react';
import { Bell } from 'lucide-react';

export const NoticesWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-indigo-500" />
          Notices
        </h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <p className="text-sm text-gray-500">No new notices from your host.</p>
      </div>
    </div>
  );
};
