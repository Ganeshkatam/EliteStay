import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LocationForm } from '@/features/host/publishing/components/LocationForm';
import { PublishingService } from '@/features/host/publishing/services/publishing.service';

export const metadata = {
  title: 'Location - Publishing Workspace',
};

export default async function LocationPage({
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

  const data = await PublishingService.getLocationSection(
    supabase,
    id,
    user.id
  );

  if (!data) {
    redirect('/host/listings');
  }

  const { location } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Where&apos;s your place located?
        </h1>
        <p className="text-slate-500 mt-1">
          Guests will only get your exact address once they&apos;ve booked a
          reservation.
        </p>
      </div>

      <LocationForm
        listingId={id}
        initialData={{
          state: location.state || '',
          city: location.city || '',
          locality: location.locality || '',
          postal_code: location.postal_code || '',
          address_line1: location.address_line1 || '',
        }}
      />
    </div>
  );
}
