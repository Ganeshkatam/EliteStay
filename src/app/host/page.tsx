/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FileText, CheckCircle, Clock, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateListingButton } from '@/features/host/components/CreateListingButton';
import { createDraftListing } from '@/features/host/actions/listing-actions';

export const metadata = {
  title: 'Host Dashboard - EliteStay',
};

export default async function HostDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // Layout handles redirect
  }

  // Fetch listing counts
  const { data: listings } = await supabase
    .from('listings')
    .select('id, status')
    .eq('host_id', user.id);

  const totalListings = listings?.length || 0;
  const publishedCount = listings?.filter((l) => l.status === 'published').length || 0;
  const draftCount = listings?.filter((l) => l.status === 'draft' || l.status === 'ready').length || 0;

  // Fetch a recent draft to "Continue Building"
  let recentDraft = null;
  if (draftCount > 0) {
    const { data: draftProgress } = await supabase
      .from('listing_build_progress')
      .select('listing_id, last_step, percent_complete, listings(title)')
      .in('listing_id', listings!.filter(l => l.status === 'draft' || l.status === 'ready').map(l => l.id))
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (draftProgress) {
      recentDraft = draftProgress;
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here&apos;s what&apos;s happening with your properties.</p>
        </div>
        <form action={createDraftListing}>
          <CreateListingButton />
        </form>
      </div>

      {recentDraft && (
        <Card className="border-blue-100 bg-blue-50/50 shadow-sm">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-blue-900">Continue building your listing</h2>
              <p className="text-sm text-blue-700 mt-1">
                You have a draft for &quot;{Array.isArray(recentDraft.listings) ? recentDraft.listings[0]?.title : (recentDraft.listings as any)?.title || 'Untitled Listing'}&quot; that is {recentDraft.percent_complete}% complete.
              </p>
            </div>
            <Link href={`/host/listings/${recentDraft.listing_id}/build/${recentDraft.last_step}`}>
              <Button variant="outline" className="bg-white hover:bg-slate-50">
                Continue Draft
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalListings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Inbox className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-slate-500 mt-1">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


