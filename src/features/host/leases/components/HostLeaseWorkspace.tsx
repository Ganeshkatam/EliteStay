'use client';

import React, { useTransition } from 'react';
import { HostLeaseViewModel } from '../api/lease-view-model.types';
import { issueLeaseAction } from '../actions/host-lease.actions';
import { markDepositCollectedAction } from '../actions/host-deposit.actions';
import { MoveInChecklist } from './MoveInChecklist';
import {
  FileText,
  CheckCircle,
  Home,
  Calendar,
  Clock,
  DollarSign,
} from 'lucide-react';

interface Props {
  leases: HostLeaseViewModel[];
}

export function HostLeaseWorkspace({ leases }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleIssueLease = (leaseId: string) => {
    startTransition(async () => {
      const result = await issueLeaseAction(leaseId);
      if (result.success) {
        alert('Lease issued to tenant!');
      } else {
        alert('Failed to issue lease');
      }
    });
  };

  const handleMarkDepositCollected = (depositId: string) => {
    startTransition(async () => {
      const result = await markDepositCollectedAction(depositId);
      if (result.success) {
        alert('Deposit marked as collected.');
      } else {
        alert('Failed to update deposit');
      }
    });
  };

  if (leases.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Home className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No leases found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You don&apos;t have any active or draft leases yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {leases.map((lease) => (
        <div
          key={lease.id}
          className="bg-white shadow overflow-hidden sm:rounded-lg"
        >
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 border-b border-gray-200">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-gray-400" />
                {lease.propertyTitle}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {lease.tenantName} ({lease.tenantEmail})
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {lease.status}
              </span>

              {lease.status === 'DRAFT' && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleIssueLease(lease.id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  <CheckCircle className="-ml-1 mr-2 h-4 w-4" />
                  Issue Lease
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Start Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {lease.startDate}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  End Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{lease.endDate}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  Monthly Rent
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${lease.monthlyRentAmount}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  Security Deposit
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${lease.securityDepositAmount}
                </dd>
              </div>
            </dl>
          </div>

          {/* Deposit Status (If applicable) */}
          {lease.securityDeposit && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Security Deposit
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lease.securityDeposit.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : lease.securityDeposit.status === 'COLLECTED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {lease.securityDeposit.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    ${lease.securityDeposit.amount}
                  </span>
                </div>

                {lease.securityDeposit.status === 'PENDING' && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      handleMarkDepositCollected(lease.securityDeposit!.id)
                    }
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50"
                  >
                    Mark as Collected (Offline)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Move-in Checklist */}
          {lease.moveIn && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-gray-400" />
                Move-In Checklist
              </h4>
              <MoveInChecklist
                moveIn={lease.moveIn}
                disabled={isPending || lease.moveIn.status === 'COMPLETED'}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
