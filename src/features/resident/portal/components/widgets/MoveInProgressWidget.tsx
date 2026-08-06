'use client';

import React from 'react';
import { MoveIn } from '@/features/tenancy/move-in/types/move-in.types';
import { Truck, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  moveIn: MoveIn | null;
}

export function MoveInProgressWidget({ moveIn }: Props) {
  if (!moveIn) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 flex flex-col items-center justify-center text-center">
        <Truck className="h-10 w-10 text-gray-300 mb-2" />
        <h4 className="text-sm font-medium text-gray-900">
          Move-In Not Scheduled
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Pay your deposit to trigger the move-in process.
        </p>
      </div>
    );
  }

  const items = [
    { label: 'Deposit Verified', completed: moveIn.depositVerified },
    { label: 'Identity Verified', completed: moveIn.identityVerified },
    { label: 'Keys Issued', completed: moveIn.keysIssued },
    {
      label: 'Condition Report Signed',
      completed: moveIn.conditionReportSigned,
    },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
      <div className="px-4 py-3 sm:px-6 bg-gray-50 flex items-center justify-between border-b border-gray-200">
        <h3 className="text-sm leading-6 font-medium text-gray-900 flex items-center">
          <Truck className="mr-2 h-4 w-4 text-gray-400" />
          Move-In Progress
        </h3>
        {moveIn.status === 'COMPLETED' ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {moveIn.status}
          </span>
        )}
      </div>

      <div className="px-4 py-4 sm:p-6">
        {moveIn.status === 'COMPLETED' ? (
          <div className="text-center py-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
            <h4 className="text-lg font-medium text-gray-900">Welcome Home!</h4>
            <p className="text-sm text-gray-500 mt-1">
              Your move-in was completed on{' '}
              {new Date(moveIn.completedAt!).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Completion Status</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <ul className="space-y-3">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-center text-sm">
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-300 mr-2 flex-shrink-0" />
                  )}
                  <span
                    className={
                      item.completed
                        ? 'text-gray-900 line-through'
                        : 'text-gray-600'
                    }
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 italic">
                Your host will update these items as you complete the move-in
                process offline.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
