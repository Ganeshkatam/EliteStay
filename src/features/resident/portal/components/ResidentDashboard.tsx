'use client';

import React from 'react';
import { ResidentViewModel } from '../api/resident-view-model.types';
import { CurrentLeaseWidget } from './widgets/CurrentLeaseWidget';
import { DepositStatusWidget } from './widgets/DepositStatusWidget';
import { MoveInProgressWidget } from './widgets/MoveInProgressWidget';
import { PropertyInformationWidget } from './widgets/PropertyInformationWidget';
import { MaintenanceWidget } from './widgets/MaintenanceWidget';
import { RentLedgerWidget } from './widgets/RentLedgerWidget';
import { NoticesWidget } from './widgets/NoticesWidget';
import { ResidentTimelineWidget } from './widgets/ResidentTimelineWidget';
import { Home, Key } from 'lucide-react';
import Link from 'next/link';

interface Props {
  viewModel: ResidentViewModel;
}

export function ResidentDashboard({ viewModel }: Props) {
  if (!viewModel.lease) {
    return (
      <div className="mx-auto mt-4 max-w-3xl rounded-lg bg-white p-6 text-center shadow sm:mt-10 sm:p-12">
        <Home className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          No Active Tenancy
        </h3>
        <p className="mt-1 text-sm text-gray-500 mb-6">
          You don&apos;t have any active leases or pending move-ins at this
          time.
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Find a Place
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow sm:rounded-lg overflow-hidden border-t-4 border-indigo-600">
        <div className="flex items-start px-4 py-5 sm:items-center sm:p-6">
          <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3">
            <Key className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-3 min-w-0 sm:ml-4">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              {viewModel.property?.title || 'Your Tenancy'}
            </h2>
            <p className="text-sm leading-5 text-gray-500">
              {viewModel.property?.address} • Hosted by{' '}
              {viewModel.property?.hostName}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        {/* Main Column - Lease & Property Info */}
        <div className="md:col-span-2 space-y-6">
          <CurrentLeaseWidget lease={viewModel.lease} />
          {viewModel.property && (
            <PropertyInformationWidget property={viewModel.property} />
          )}
          <ResidentTimelineWidget />
        </div>

        {/* Sidebar - Move-In & Deposit */}
        <div className="space-y-6">
          <MoveInProgressWidget moveIn={viewModel.moveIn} />
          <DepositStatusWidget deposit={viewModel.deposit} />
          <RentLedgerWidget />
          <MaintenanceWidget />
          <NoticesWidget />
        </div>
      </div>
    </div>
  );
}
