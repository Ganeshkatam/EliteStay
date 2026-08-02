'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { ListingPublishingViewModel } from '../view-models/listing-publishing.viewmodel';

export function PublishingReadinessChecklist({
  viewModel,
}: {
  viewModel: ListingPublishingViewModel;
}) {
  const { required, recommended, optional } = viewModel.publishing;

  return (
    <div className="space-y-6 pt-4 border-t border-slate-200">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Readiness Checklist
      </h3>

      {/* Required Items */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Required ({required.length})
        </div>
        {required.length === 0 ? (
          <p className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            All required items complete!
          </p>
        ) : (
          <ul className="space-y-1.5">
            {required.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs">
                <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <Link
                  href={`/host/listings/${viewModel.listingId}/build/${item.sectionId}`}
                  className="text-slate-700 hover:text-blue-600 hover:underline transition-colors"
                >
                  {item.message}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recommended Items */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Recommended ({recommended.length})
        </div>
        {recommended.length === 0 ? (
          <p className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            All best practices met!
          </p>
        ) : (
          <ul className="space-y-1.5">
            {recommended.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <Link
                  href={`/host/listings/${viewModel.listingId}/build/${item.sectionId}`}
                  className="text-slate-700 hover:text-blue-600 hover:underline transition-colors"
                >
                  {item.message}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Optional Items */}
      {optional.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Optional
          </div>
          <ul className="space-y-1.5">
            {optional.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs">
                <Info className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                <Link
                  href={`/host/listings/${viewModel.listingId}/build/${item.sectionId}`}
                  className="text-slate-700 hover:text-blue-600 hover:underline transition-colors"
                >
                  {item.message}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
