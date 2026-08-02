import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FeaturesForm } from '@/features/host/publishing/components/FeaturesForm';
import { PublishingService } from '@/features/host/publishing/services/publishing.service';

export const metadata = {
  title: 'Features - Publishing Workspace',
};

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const data = await PublishingService.getFeaturesSection(
    supabase,
    id,
    user.id
  );

  if (!data) redirect('/host/listings');

  const { features, amenities } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Features & Amenities
        </h1>
        <p className="text-slate-500 mt-1">
          Let guests know what your property offers.
        </p>
      </div>

      <FeaturesForm
        listingId={id}
        initialData={features}
        amenities={amenities}
      />
    </div>
  );
}
