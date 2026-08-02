import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  Clock,
  AlertCircle,
  ArrowRight,
  Calendar,
  Settings,
  FileEdit,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateListingButton } from '@/features/host/components/CreateListingButton';
import { createDraftListing } from '@/features/host/actions/listing-actions';
import {
  ListingHealthService,
  ListingAction,
} from '@/features/host/services/listing-health.service';

export default async function HostDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch user profile for the greeting
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const firstName = profile?.full_name?.split(' ')[0] || 'Host';

  // 2. Fetch operational data
  const [{ data: listings }, { count: pendingBookingsCount }] =
    await Promise.all([
      supabase
        .from('listings')
        .select(
          `
        id, 
        public_id,
        status, 
        title, 
        description,
        city, 
        locality,
        images:listing_images(storage_path),
        prices:listing_prices(amount, billing_period),
        listing_build_progress(percent_complete, last_step)
      `
        )
        .eq('host_id', user.id),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
        // Note: In a real app we'd join listings to ensure the host owns the listing being booked
        .limit(1),
    ]);

  const rawListings = listings || [];

  // Evaluate health for all listings
  const evaluatedListings = rawListings.map((listing) => ({
    ...listing,
    health: ListingHealthService.evaluate(
      listing as unknown as import('@/features/host/services/listing-health.service').RawListingData
    ),
  }));

  const activeDrafts = evaluatedListings.filter(
    (l) => l.health.status === 'draft'
  );
  const needsAttentionListings = evaluatedListings.filter(
    (l) => l.health.status === 'needs_attention'
  );
  const publishedListings = evaluatedListings.filter(
    (l) => l.status === 'published'
  ).length;

  // Calculate "Needs Attention" items
  const attentionItems = [];

  if (pendingBookingsCount && pendingBookingsCount > 0) {
    attentionItems.push({
      id: 'pending_bookings',
      title: `${pendingBookingsCount} booking request${pendingBookingsCount > 1 ? 's' : ''} to review`,
      type: 'urgent',
      href: '/host/bookings',
    });
  }

  // Add listings that need attention (e.g. low score, missing items)
  needsAttentionListings.forEach((listing) => {
    const title = listing.title || 'Untitled Listing';
    const warningMsg =
      listing.health.warnings.length > 0
        ? listing.health.warnings[0].message
        : `Missing required information`;

    // Determine where to link based on the primary action recommended
    let href = `/host/listings/${listing.id}/edit`;
    if (listing.health.primaryAction === ListingAction.ResumeBuild) {
      const step =
        listing.listing_build_progress?.[0]?.last_step || 'accommodation';
      href = `/host/listings/${listing.id}/build/${step}`;
    } else if (listing.health.primaryAction === ListingAction.AddImages) {
      href = `/host/listings/${listing.id}/build/photos`;
    } else if (listing.health.primaryAction === ListingAction.AddPricing) {
      href = `/host/listings/${listing.id}/build/pricing`;
    }

    attentionItems.push({
      id: `attention_${listing.id}`,
      title: `"${title}" needs attention: ${warningMsg}`,
      type: 'urgent',
      href,
    });
  });

  // Add active drafts that are in progress
  activeDrafts.forEach((draft) => {
    const title = draft.title || 'Untitled Listing';
    const step =
      draft.listing_build_progress?.[0]?.last_step || 'accommodation';

    attentionItems.push({
      id: `draft_${draft.id}`,
      title: `Finish setting up "${title}" (${draft.health.completion}% complete)`,
      type: 'warning',
      href: `/host/listings/${draft.id}/build/${step}`,
    });
  });

  if (attentionItems.length === 0) {
    attentionItems.push({
      id: 'all_good',
      title: 'You&apos;re all caught up for today.',
      type: 'success',
      href: null,
    });
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Good morning, {firstName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here&apos;s what&apos;s happening with your properties today.
          </p>
        </div>
        <form action={createDraftListing}>
          <CreateListingButton />
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Action Center & Activity */}
        <div className="md:col-span-8 space-y-6">
          {/* Action Center / Needs Attention */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Needs Attention
            </h2>
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {attentionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.type === 'urgent' && (
                        <AlertCircle className="h-5 w-5 text-rose-500" />
                      )}
                      {item.type === 'warning' && (
                        <Clock className="h-5 w-5 text-amber-500" />
                      )}
                      {item.type === 'success' && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      )}
                      <span className="text-sm font-medium text-slate-700">
                        {item.title}
                      </span>
                    </div>
                    {item.href && (
                      <Link href={item.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-slate-900"
                        >
                          Resolve
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Today's Activity Feed */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Today&apos;s Activity
            </h2>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-8 text-center text-slate-500">
                <p className="text-sm">No new activity yet today.</p>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Right Column: Snapshots & Quick Links */}
        <div className="md:col-span-4 space-y-6">
          {/* KPI Snapshot */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Published
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {publishedListings}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Drafts
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {activeDrafts.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm col-span-2">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Pending Bookings
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {pendingBookingsCount || 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Quick Actions (Context Aware) */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Quick Actions
            </h2>
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-col divide-y divide-slate-100">
                {rawListings.length === 0 ? (
                  <form action={createDraftListing} className="w-full block">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 text-left"
                    >
                      <FileEdit className="h-4 w-4 text-emerald-500" />
                      Create your first listing
                    </button>
                  </form>
                ) : publishedListings === 0 && activeDrafts.length > 0 ? (
                  <Link
                    href={`/host/listings/${activeDrafts[0].id}/build/${activeDrafts[0].listing_build_progress?.[0]?.last_step || 'accommodation'}`}
                    className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                  >
                    <FileEdit className="h-4 w-4 text-amber-500" />
                    Complete your first listing
                  </Link>
                ) : (
                  <Link
                    href="/host/listings/new"
                    className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                  >
                    <FileEdit className="h-4 w-4 text-slate-400" />
                    Create new listing
                  </Link>
                )}

                {(pendingBookingsCount ?? 0) > 0 && (
                  <Link
                    href="/host/bookings"
                    className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                  >
                    <Calendar className="h-4 w-4 text-rose-500" />
                    Review pending bookings
                  </Link>
                )}

                {publishedListings > 0 && (
                  <Link
                    href="/host/calendar"
                    className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                  >
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Manage Availability
                  </Link>
                )}

                <Link
                  href="/host/settings"
                  className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Host Settings
                </Link>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
