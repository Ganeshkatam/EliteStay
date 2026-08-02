'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import {
  ListingPublishingViewModel,
  SidebarSection,
} from '../view-models/listing-publishing.viewmodel';
import { PublishingReadinessChecklist } from './PublishingReadinessChecklist';

export function PublishingWorkspaceSidebar({
  viewModel,
}: {
  viewModel: ListingPublishingViewModel;
}) {
  const pathname = usePathname();

  const renderStatusIcon = (status: SidebarSection['status']) => {
    switch (status) {
      case 'complete':
        return (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        );
      case 'warning':
        return (
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
        );
      case 'incomplete':
      default:
        return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Navigation */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Sections
        </h2>
        <nav className="space-y-1">
          {viewModel.sidebar.map((section) => {
            const href = `/host/listings/${viewModel.listingId}/build/${section.id}`;
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={section.id}
                href={href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-200/70 text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{section.label}</span>
                {renderStatusIcon(section.status)}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Listing Quality Card */}
      <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Listing Quality
          </h3>
          <span className="text-sm font-bold text-slate-900">
            {viewModel.health.score}%
          </span>
        </div>

        <div className="space-y-2">
          {viewModel.health.contributors.map((c) => (
            <div key={c.id} className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600">
                <span>{c.label}</span>
                <span className="font-medium">{c.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    c.score === 100
                      ? 'bg-emerald-500'
                      : c.score >= 60
                        ? 'bg-amber-400'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${c.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Readiness Checklist */}
      <PublishingReadinessChecklist viewModel={viewModel} />
    </div>
  );
}
