import React from 'react';
import { CreditCard } from 'lucide-react';

export const RentLedgerWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-indigo-500" />
          Rent Ledger
        </h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
          Make Payment
        </button>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-500">
            Current Balance
          </span>
          <span className="text-2xl font-bold text-gray-900">₹0</span>
        </div>
        <p className="text-sm text-gray-500">Your account is fully paid.</p>
      </div>
    </div>
  );
};
