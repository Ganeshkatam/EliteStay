'use client';

import React, { useTransition } from 'react';
import { ResidentViewModel } from '../../api/resident-view-model.types';
import { signLeaseAction } from '../../actions/resident-lease.actions';
import { FileSignature, Calendar, DollarSign, CheckCircle } from 'lucide-react';

interface Props {
  lease: NonNullable<ResidentViewModel['lease']>;
}

export function CurrentLeaseWidget({ lease }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleSign = () => {
    startTransition(async () => {
      const result = await signLeaseAction(lease.id);
      if (result.success) {
        alert('Lease successfully signed!');
      } else {
        alert('Failed to sign lease.');
      }
    });
  };

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <FileSignature className="mr-2 h-5 w-5 text-gray-400" />
          Lease Agreement
        </h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Start Date
              </p>
              <p className="font-medium text-gray-900">{lease.startDate}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                End Date
              </p>
              <p className="font-medium text-gray-900">{lease.endDate}</p>
            </div>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Monthly Rent
              </p>
              <p className="font-medium text-gray-900">
                ${lease.monthlyRentAmount}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Security Deposit
              </p>
              <p className="font-medium text-gray-900">
                ${lease.securityDepositAmount}
              </p>
            </div>
          </div>
        </div>

        {/* Action Area based on Status */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          {lease.status === 'ISSUED' && (
            <div className="rounded-md bg-yellow-50 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Signature Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your host has issued the lease. Please review the terms
                      and sign digitally to proceed with your move-in.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleSign}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50"
                    >
                      <CheckCircle className="-ml-1 mr-2 h-4 w-4" />
                      Sign Lease Agreement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {lease.status === 'SIGNED' && (
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Lease Signed
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      You have successfully signed the lease. Next step: pay
                      your security deposit to schedule your move-in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(lease.status === 'ACTIVE' || lease.status === 'RENEWED') && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <h3 className="text-sm font-medium text-green-800">
                  Your lease is currently active.
                </h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
