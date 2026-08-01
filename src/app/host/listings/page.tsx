import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Search, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { CreateListingButton } from '@/features/host/components/CreateListingButton';
import { createDraftListing } from '@/features/host/actions/listing-actions';

export const metadata = {
  title: 'My Listings - Host - EliteStay',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'published':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
          Published
        </Badge>
      );
    case 'ready':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Ready
        </Badge>
      );
    case 'draft':
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
          Draft
        </Badge>
      );
    case 'pending_review':
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          In Review
        </Badge>
      );
    case 'paused':
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          Paused
        </Badge>
      );
    case 'archived':
      return (
        <Badge variant="outline" className="text-slate-500">
          Archived
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

interface ListingRow {
  id: string;
  title: string | null;
  status: string;
  updated_at: string | null;
  city: string | null;
  locality: string | null;
  accommodation_type?: { name: string } | null;
  prices?: { amount: number; billing_period: string }[] | null;
  images?: { storage_path: string }[] | null;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HostListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch all listings for this host with related data
  const { data: listings } = await supabase
    .from('listings')
    .select(
      `
      id,
      title,
      status,
      updated_at,
      city,
      locality,
      accommodation_type:accommodation_types(name),
      prices:listing_prices(amount, billing_period),
      images:listing_images(storage_path)
    `
    )
    .eq('host_id', user.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Listings
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your properties and inventory.
          </p>
        </div>
        <form action={createDraftListing}>
          <CreateListingButton />
        </form>
      </div>

      {/* Basic Search / Filter Bar (Visual only for V1) */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search listings..."
            className="pl-9"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Listing</th>
                <th className="px-6 py-4">Visibility</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    You haven&apos;t created any listings yet.
                  </td>
                </tr>
              ) : (
                (listings as unknown as ListingRow[] | null)?.map((listing) => {
                  // Get cover image (first image, or placeholder)
                  const coverImage =
                    listing.images && listing.images.length > 0
                      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listings/${listing.images[0].storage_path}`
                      : '/placeholder-property.jpg'; // We should probably add a placeholder image

                  const accType =
                    listing.accommodation_type?.name || 'Unknown Type';
                  const loc =
                    listing.locality && listing.city
                      ? `${listing.locality}, ${listing.city}`
                      : listing.city || listing.locality || 'No location';
                  const price = listing.prices?.[0]
                    ? `₹${listing.prices[0].amount.toLocaleString('en-IN')} / ${listing.prices[0].billing_period}`
                    : 'Not set';

                  return (
                    <tr
                      key={listing.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                            <Image
                              src={coverImage}
                              alt={listing.title || 'Untitled'}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div
                              className="font-medium text-slate-900 max-w-xs truncate"
                              title={listing.title || 'Untitled Listing'}
                            >
                              {listing.title || 'Untitled Listing'}
                            </div>
                            <div className="text-slate-500 text-xs mt-1">
                              {accType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={listing.status} />
                      </td>
                      <td
                        className="px-6 py-4 text-slate-600 max-w-[200px] truncate"
                        title={loc}
                      >
                        {loc}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{price}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={
                            listing.status === 'published'
                              ? `/host/listings/${listing.id}`
                              : `/host/listings/${listing.id}/build/accommodation`
                          }
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-blue-600"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
