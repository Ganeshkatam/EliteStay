import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';
import { PublishButton } from '@/features/host/components/PublishButton';

export const metadata = {
  title: 'Step 6: Review - Build Listing',
};

function SectionItem({ title, isComplete, editUrl }: { title: string, isComplete: boolean, editUrl: string }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
      <div className="flex items-center gap-3">
        {isComplete ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <AlertCircle className="h-5 w-5 text-amber-500" />
        )}
        <span className="font-medium text-slate-700">{title}</span>
      </div>
      <Link href={editUrl}>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          <Edit2 className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </Link>
    </div>
  );
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch all listing data to validate completeness
  const { data: listing } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      description,
      accommodation_type_id,
      max_occupants,
      listing_locations(id),
      listing_prices(id),
      listing_images(id)
    `)
    .eq('id', id)
    .single();

  if (!listing) redirect('/host/listings');

  // Check completeness
  const hasAccommodation = !!(listing.title && listing.title.length >= 10 && listing.description && listing.description.length >= 20 && listing.accommodation_type_id);
  const hasLocation = !!(listing.listing_locations && listing.listing_locations.length > 0);
  const hasFeatures = !!listing.max_occupants; // Basic check
  const hasPricing = !!(listing.listing_prices && listing.listing_prices.length > 0);
  const hasImages = !!(listing.listing_images && listing.listing_images.length > 0);

  const canPublish = hasAccommodation && hasLocation && hasFeatures && hasPricing && hasImages;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Review your listing</h1>
        <p className="text-slate-500 mt-1">Here's what we have so far. Make sure everything looks good before publishing.</p>
      </div>

      <div className="space-y-3">
        <SectionItem
          title="Accommodation Details"
          isComplete={hasAccommodation}
          editUrl={`/host/listings/${id}/build/accommodation`}
        />
        <SectionItem
          title="Location"
          isComplete={hasLocation}
          editUrl={`/host/listings/${id}/build/location`}
        />
        <SectionItem
          title="Features & Amenities"
          isComplete={hasFeatures}
          editUrl={`/host/listings/${id}/build/features`}
        />
        <SectionItem
          title="Pricing"
          isComplete={hasPricing}
          editUrl={`/host/listings/${id}/build/pricing`}
        />
        <SectionItem
          title="Photos"
          isComplete={hasImages}
          editUrl={`/host/listings/${id}/build/images`}
        />
      </div>

      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900">Ready to go live?</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          By publishing your listing, you agree to EliteStay's Host Terms and Policies.
          {canPublish ? " Your listing will become visible to guests immediately." : " Please complete all sections above to publish."}
        </p>

        <div className="flex gap-4">
          <Link href="/host/listings">
            <Button variant="outline" className="bg-white">Save as Draft & Exit</Button>
          </Link>
          <PublishButton listingId={id} disabled={!canPublish} />
        </div>
      </div>
    </div>
  );
}
