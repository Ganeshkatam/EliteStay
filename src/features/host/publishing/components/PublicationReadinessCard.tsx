import React from 'react';
import {
  ShieldCheck,
  CreditCard,
  FileText,
  Camera,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { ListingPublicationEligibility } from '@/features/hosting/types/hosting.types';
import { cn } from '@/lib/utils';

import Link from 'next/link';

interface PublicationReadinessCardProps {
  eligibility: ListingPublicationEligibility;
  listingId?: string;
  className?: string;
}

export function PublicationReadinessCard({
  eligibility,
  listingId,
  className,
}: PublicationReadinessCardProps) {
  const {
    hostRequirements,
    listingRequirements,
    eligible,
    missingRequirements,
  } = eligibility;

  const hostItems = [
    {
      id: 'identity',
      label: 'Identity Verification (KYC)',
      isComplete: hostRequirements.identityVerified,
      icon: ShieldCheck,
      href: '/host/compliance#identity',
      actionLabel: 'Complete KYC',
      description: hostRequirements.identityVerified
        ? 'Government ID verified'
        : 'Official ID verification required before live hosting',
    },
    {
      id: 'payout',
      label: 'Payout Bank Account',
      isComplete: hostRequirements.payoutVerified,
      icon: CreditCard,
      href: '/host/compliance#payout',
      actionLabel: 'Set Up Payout',
      description: hostRequirements.payoutVerified
        ? 'Bank account verified for direct deposits'
        : 'Connect verified bank account to receive rent',
    },
    {
      id: 'tax',
      label: 'Tax Registration (PAN / GST)',
      isComplete: hostRequirements.taxVerified,
      icon: FileText,
      href: '/host/compliance#tax',
      actionLabel: 'Register Tax',
      description: hostRequirements.taxVerified
        ? 'Tax identifier recorded'
        : 'Statutory tax registration required',
    },
  ];

  const listingItems = [
    {
      id: 'content',
      label: 'Basic Listing Information',
      isComplete: listingRequirements.contentComplete,
      icon: FileText,
      href: listingId
        ? `/host/listings/${listingId}/build/accommodation`
        : undefined,
      actionLabel: 'Edit Details',
      description: listingRequirements.contentComplete
        ? 'Title and details completed'
        : 'Provide listing title and room description',
    },
    {
      id: 'location',
      label: 'Location & Map Coordinates',
      isComplete: listingRequirements.locationComplete,
      icon: MapPin,
      href: listingId
        ? `/host/listings/${listingId}/build/location`
        : undefined,
      actionLabel: 'Set Location',
      description: listingRequirements.locationComplete
        ? 'Address & GPS coordinates verified'
        : 'Add full address and property pin',
    },
    {
      id: 'pricing',
      label: 'Pricing & Deposit Terms',
      isComplete: listingRequirements.pricingConfigured,
      icon: DollarSign,
      href: listingId ? `/host/listings/${listingId}/build/pricing` : undefined,
      actionLabel: 'Set Pricing',
      description: listingRequirements.pricingConfigured
        ? 'Monthly rent & security deposit configured'
        : 'Set monthly rent structure',
    },
    {
      id: 'photos',
      label: 'Property Photos',
      isComplete: listingRequirements.photosPresent,
      icon: Camera,
      href: listingId ? `/host/listings/${listingId}/build/images` : undefined,
      actionLabel: 'Upload Photos',
      description: listingRequirements.photosPresent
        ? 'Property photos uploaded'
        : 'Upload high-resolution property photos',
    },
  ];

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Publication Readiness Checklist
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Satisfy host compliance and listing requirements to publish this
            property to live residents.
          </p>
        </div>

        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border',
            eligible
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          )}
        >
          {eligible ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Ready to Publish
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" /> {missingRequirements.length} Pending
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Host Compliance Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              1. Host Compliance
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Workspace Level
            </span>
          </div>

          <div className="space-y-2.5">
            {hostItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={cn(
                    'p-3.5 rounded-xl border transition-all flex items-start gap-3',
                    item.isComplete
                      ? 'bg-emerald-50/30 border-emerald-100 text-slate-800'
                      : 'bg-slate-50/50 border-slate-200 text-slate-600'
                  )}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                      item.isComplete
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-500'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        {item.label}
                      </h4>
                      {item.isComplete ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Verified
                        </span>
                      ) : (
                        <Link
                          href={item.href}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors shrink-0"
                        >
                          {item.actionLabel} &rarr;
                        </Link>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Listing Health Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              2. Listing Health
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Listing Level
            </span>
          </div>

          <div className="space-y-2.5">
            {listingItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={cn(
                    'p-3.5 rounded-xl border transition-all flex items-start gap-3',
                    item.isComplete
                      ? 'bg-emerald-50/30 border-emerald-100 text-slate-800'
                      : 'bg-slate-50/50 border-slate-200 text-slate-600'
                  )}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                      item.isComplete
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-500'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        {item.label}
                      </h4>
                      {item.isComplete ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Complete
                        </span>
                      ) : item.href ? (
                        <Link
                          href={item.href}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors shrink-0"
                        >
                          {item.actionLabel} &rarr;
                        </Link>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!eligible && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Publication Locked:</strong> EliteStay requires both
            verified host compliance and complete property information before
            exposing a listing to live student and professional tenants.
          </p>
        </div>
      )}
    </div>
  );
}
