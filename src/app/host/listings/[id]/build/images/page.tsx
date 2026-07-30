import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ImagesForm } from '@/features/host/components/ImagesForm';

export const metadata = {
  title: 'Step 5: Images - Build Listing',
};

export default async function ImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify ownership
  const { data: listing } = await supabase
    .from('listings')
    .select('id, host_id')
    .eq('id', id)
    .single();

  if (!listing) redirect('/host/listings');

  // Fetch current images
  const { data: images } = await supabase
    .from('listing_images')
    .select('*')
    .eq('listing_id', id)
    .order('display_order');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add photos to your listing</h1>
        <p className="text-slate-500 mt-1">Upload at least 1 photo (maximum 5) to show off your property.</p>
      </div>

      <ImagesForm
        listingId={id}
        initialImages={images || []}
      />
    </div>
  );
}
