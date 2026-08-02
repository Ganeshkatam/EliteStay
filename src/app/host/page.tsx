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
  const [
    { data: listings },
    { count: pendingBookingsCount },
    { data: draftsInProgress },
  ] = await Promise.all([
    supabase.from('listings').select('id, status').eq('host_id', user.id),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      // Note: In a real app we'd join listings to ensure the host owns the listing being booked
      .limit(1),
    supabase
      .from('listing_build_progress')
      .select('listing_id, percent_complete, last_step, listings(title)')
      .eq('listings.host_id', user.id)
      .lt('percent_complete', 100)
      .order('updated_at', { ascending: false }),
  ]);

  const activeDrafts = draftsInProgress || [];
  const publishedListings =
    listings?.filter((l) => l.status === 'published')?.length || 0;

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

  activeDrafts.forEach((draft) => {
    const title = Array.isArray(draft.listings)
      ? draft.listings[0]?.title
      : (draft.listings as { title?: string })?.title || 'Untitled Listing';

    attentionItems.push({
      id: `draft_${draft.listing_id}`,
      title: `Finish setting up "${title}" (${draft.percent_complete}% complete)`,
      type: 'warning',
      href: `/host/listings/${draft.listing_id}/build/${draft.last_step}`,
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
              Snapshot
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Active Listings
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {publishedListings}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Occupancy
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">--%</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm col-span-2">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Revenue (This Month)
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">₹0</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              Quick Actions
            </h2>
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-col divide-y divide-slate-100">
                <Link
                  href="/host/calendar"
                  className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                >
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Manage Availability
                </Link>
                <Link
                  href="/host/listings"
                  className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                >
                  <FileEdit className="h-4 w-4 text-slate-400" />
                  Edit Listings
                </Link>
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
