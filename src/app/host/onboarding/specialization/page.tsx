import React from 'react';
import Link from 'next/link';
import { HostAccessService } from '@/features/hosting/services/host-access.service';
import { HostingService } from '@/features/hosting';
import { submitSpecializationStepAction } from '@/features/hosting/actions/hosting.actions';
import { OnboardingSubmitButton } from '@/features/hosting/components/OnboardingSubmitButton';
import { Building2, Home, Hotel, Sparkles } from 'lucide-react';

const ACCOMMODATION_TYPES = [
  {
    slug: 'pg',
    title: 'Paying Guest (PG)',
    description:
      'Furnished shared or private rooms with integrated food, utilities, and daily housekeeping.',
    icon: Home,
    tag: 'Popular for Students & Workers',
  },
  {
    slug: 'hostel',
    title: 'Student & Youth Hostel',
    description:
      'Community-driven accommodation with high-density dorms, study zones, and meal facilities.',
    icon: Hotel,
    tag: 'High Occupancy',
  },
  {
    slug: 'apartment',
    title: 'Serviced & Shared Apartment',
    description:
      'Private flats, studio units, or co-living spaces with independent amenities and kitchens.',
    icon: Building2,
    tag: 'Long-Term Stays',
  },
  {
    slug: 'other',
    title: 'Other Long-Term Stay',
    description:
      'Unique residential concepts, guest homes, and bespoke long-term hospitality spaces.',
    icon: Sparkles,
    tag: 'Flexible Models',
  },
];

export default async function SpecializationStepPage() {
  const { user } = await HostAccessService.getHostContext();
  const hostingService = new HostingService();
  const viewModel = await hostingService.getOnboardingWorkspace(user.id);

  const currentSlug = viewModel.formData.primaryAccommodationSlug || 'pg';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Select Your Accommodation Specialization
        </h2>
        <p className="text-slate-500 text-sm">
          EliteStay hosts specialize in residential living categories. Choose
          your primary accommodation type to customize your hosting workspace.
        </p>
      </div>

      <form action={submitSpecializationStepAction} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACCOMMODATION_TYPES.map((type) => {
            const Icon = type.icon;
            const isDefault = type.slug === currentSlug;

            return (
              <label
                key={type.slug}
                className="relative flex flex-col justify-between p-5 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all duration-200 has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50/20 has-[:checked]:ring-1 has-[:checked]:ring-rose-500"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <input
                      type="radio"
                      name="primaryAccommodationSlug"
                      value={type.slug}
                      defaultChecked={isDefault}
                      className="w-4 h-4 text-rose-600 border-slate-300 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {type.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="inline-block text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {type.tag}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4">
          <Link
            href="/host/onboarding/identity"
            className="text-xs font-bold text-slate-500 hover:text-slate-900"
          >
            Back to Identity
          </Link>
          <OnboardingSubmitButton
            label="Save Specialization & Continue"
            loadingLabel="Saving..."
          />
        </div>
      </form>
    </div>
  );
}
