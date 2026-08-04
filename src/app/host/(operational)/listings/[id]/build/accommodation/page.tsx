import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AccommodationForm } from '@/features/host/publishing/components/AccommodationForm';
import { PublishingService } from '@/features/host/publishing/services/publishing.service';

export const metadata = {
  title: 'Accommodation - Publishing Workspace',
};

export default async function AccommodationPage({
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

  const data = await PublishingService.getAccommodationSection(
    supabase,
    id,
    user.id
  );

  if (!data || !data.listing) {
    redirect('/host/listings');
  }

  const { listing, accommodationTypes } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Tell us about your place
        </h1>
        <p className="text-slate-500 mt-1">
          Provide basic information about your property. Your edits save
          automatically.
        </p>
      </div>

      <AccommodationForm
        listingId={listing.id}
        initialData={{
          title: listing.title || '',
          description: listing.description || '',
          accommodation_type_id: listing.accommodation_type_id || '',
        }}
        accommodationTypes={accommodationTypes}
      />
    </div>
  );
}
