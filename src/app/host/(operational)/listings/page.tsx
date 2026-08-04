import { HostAccessService } from '@/features/hosting/services/host-access.service';
import { CreateListingButton } from '@/features/host/components/CreateListingButton';
import { createDraftListing } from '@/features/host/actions/listing-actions';
import { ListingsWorkspace } from '@/features/host/components/ListingsWorkspace';
import { HostRepository } from '@/features/host/repositories/host.repository';

export const metadata = {
  title: 'My Listings - Host Workspace - EliteStay',
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HostListingsPage() {
  const { supabase, user } = await HostAccessService.requireOperationalHost();

  // Fetch all listings via repository (Thin Route Rule)
  const listings = await HostRepository.getListings(supabase, user.id);

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
