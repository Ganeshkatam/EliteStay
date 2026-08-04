import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ImagesForm } from '@/features/host/publishing/components/ImagesForm';
import { PublishingService } from '@/features/host/publishing/services/publishing.service';

export const metadata = {
  title: 'Photos - Publishing Workspace',
};

export default async function ImagesPage({
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

  const data = await PublishingService.getImagesSection(supabase, id, user.id);

  if (!data) redirect('/host/listings');

  const { images } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Add photos to your listing
        </h1>
        <p className="text-slate-500 mt-1">
          Upload at least 1 photo (maximum 5) to show off your property.
        </p>
      </div>

      <ImagesForm listingId={id} initialImages={images} />
    </div>
  );
}
