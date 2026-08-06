'use client';

import React, { useTransition } from 'react';
import { HostApplicationViewModel } from '../view-models/application.view-model';
import {
  approveApplicationAction,
  rejectApplicationAction,
} from '../actions/host-application.actions';
import Image from 'next/image';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Props {
  initialApplications: HostApplicationViewModel[];
}

export function HostApplicationsList({ initialApplications }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const result = await approveApplicationAction(id);
      if (result.success) {
        alert('Application Approved!');
      } else {
        alert('Failed to approve application');
      }
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      const result = await rejectApplicationAction(id);
      if (result.success) {
        alert('Application Rejected.');
      } else {
        alert('Failed to reject application');
      }
    });
  };

  if (initialApplications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Clock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No pending applications
        </h3>
        <p className="mt-1 text-sm text-gray-500">You&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {initialApplications.map((app) => (
        <div
          key={app.id}
          className="bg-white shadow overflow-hidden sm:rounded-lg"
        >
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {app.listing.title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Submitted {new Date(app.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-3">
              {app.actions.canApprove && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleApprove(app.id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle
                    className="-ml-1 mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Approve
                </button>
              )}
              {app.actions.canReject && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReject(app.id)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <XCircle
                    className="-ml-1 mr-2 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  Reject
                </button>
              )}
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1 flex items-center space-x-4">
                {app.applicant.avatarUrl ? (
                  <Image
                    src={app.applicant.avatarUrl}
                    alt={app.applicant.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">
                      {app.applicant.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Applicant
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {app.applicant.name}
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Move-in Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{app.moveInDate}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Lease Duration
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {app.leaseDurationMonths} months
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Employment Status
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {app.applicant.employmentStatus || 'Not provided'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Income Range
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {app.applicant.incomeRange || 'Not provided'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Pet Information
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {app.applicant.petInformation || 'None'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Guarantor Information
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {app.applicant.guarantorInformation || 'None provided'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ))}
    </div>
  );
}
