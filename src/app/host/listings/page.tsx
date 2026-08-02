import { createClient } from '@/lib/supabase/server';
import { CreateListingButton } from '@/features/host/components/CreateListingButton';
import { createDraftListing } from '@/features/host/actions/listing-actions';
import { ListingsWorkspace } from '@/features/host/components/ListingsWorkspace';

export const metadata = {
  title: 'My Listings - Host Workspace - EliteStay',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HostListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch all listings for this host with related operational data
  const { data: listings } = await supabase
    .from('listings')
    .select(
      `
      id,
      public_id,
      title,
      status,
      updated_at,
      city,
      locality,
      accommodation_type:accommodation_types(name),
      prices:listing_prices(amount, billing_period),
      images:listing_images(storage_path),
      listing_build_progress(percent_complete, last_step)
    `
    )
    .eq('host_id', user.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Listings Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your properties, availability, and pricing.
          </p>
        </div>
        <form action={createDraftListing}>
          <CreateListingButton />
        </form>
      </div>

      <ListingsWorkspace listings={listings || []} />
    </div>
  );
}
