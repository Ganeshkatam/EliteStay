'use client';

import React, { useState, useTransition } from 'react';
import { ResidentViewModel } from '../../api/resident-view-model.types';
import { signLeaseAction } from '../../actions/resident-lease.actions';
import {
  FileSignature,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Props {
  lease: NonNullable<ResidentViewModel['lease']>;
}

export function CurrentLeaseWidget({ lease }: Props) {
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSign = () => {
    setStatusMessage(null);
    startTransition(async () => {
      const result = await signLeaseAction(lease.id);
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: 'Lease successfully signed! You can now proceed to security deposit payment.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Failed to sign lease. Please try again or contact support.',
        });
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
        {statusMessage && (
          <div
            role="status"
            className={`mb-6 flex items-start gap-3 rounded-xl p-4 text-sm font-medium ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            )}
            <p className="flex-1 leading-snug">{statusMessage.text}</p>
          </div>
        )}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      className="inline-flex min-h-11 items-center rounded-md border border-transparent bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
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
