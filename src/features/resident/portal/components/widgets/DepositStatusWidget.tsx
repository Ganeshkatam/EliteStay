'use client';

import React from 'react';
import { SecurityDeposit } from '@/features/tenancy/deposit/types/deposit.types';
import { ShieldCheck, ShieldAlert, DollarSign } from 'lucide-react';

interface Props {
  deposit: SecurityDeposit | null;
}

export function DepositStatusWidget({ deposit }: Props) {
  if (!deposit) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 flex flex-col items-center justify-center text-center">
        <ShieldAlert className="h-10 w-10 text-gray-300 mb-2" />
        <h4 className="text-sm font-medium text-gray-900">
          No Deposit Required
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          A security deposit has not been requested yet.
        </p>
      </div>
    );
  }

  const isCollected =
    deposit.status === 'COLLECTED' || deposit.status === 'HELD';

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
      <div
        className={`px-4 py-3 sm:px-6 flex items-center justify-between ${isCollected ? 'bg-green-50' : 'bg-yellow-50'}`}
      >
        <h3 className="text-sm leading-6 font-medium text-gray-900 flex items-center">
          {isCollected ? (
            <ShieldCheck className="mr-2 h-5 w-5 text-green-500" />
          ) : (
            <ShieldAlert className="mr-2 h-5 w-5 text-yellow-500" />
          )}
          Security Deposit
        </h3>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isCollected
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {deposit.status}
        </span>
      </div>
      <div className="px-4 py-5 sm:p-6 text-center">
        <div className="flex justify-center items-end space-x-1">
          <DollarSign className="h-6 w-6 text-gray-400" />
          <span className="text-3xl font-extrabold text-gray-900">
            {deposit.amount}
          </span>
        </div>

        {!isCollected && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Please coordinate with your host to complete the security deposit
              payment offline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
