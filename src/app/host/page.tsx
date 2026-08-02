import { createClient } from '@/lib/supabase/server';
import { HostOperationsService } from '@/features/host/services/host-operations.service';
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

  const viewModel = await HostOperationsService.getDashboardOverview(
    supabase,
    user.id
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Good morning, {viewModel.firstName}
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
                {viewModel.attentionItems.map((item) => (
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
                    {viewModel.kpis.publishedCount}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Drafts
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {viewModel.kpis.draftsCount}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm col-span-2">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Pending Bookings
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {viewModel.kpis.pendingBookingsCount}
                  </p>
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
                {viewModel.quickActions.map((action) => {
                  const Icon =
                    action.icon === 'file-edit'
                      ? FileEdit
                      : action.icon === 'settings'
                        ? Settings
                        : Calendar;
                  const iconColor =
                    action.id === 'create_first'
                      ? 'text-emerald-500'
                      : action.id === 'complete_first'
                        ? 'text-amber-500'
                        : action.id === 'review_bookings'
                          ? 'text-rose-500'
                          : 'text-slate-400';

                  if (action.href === '/host/listings/new') {
                    return (
                      <form
                        key={action.id}
                        action={createDraftListing}
                        className="w-full block"
                      >
                        <button
                          type="submit"
                          className="w-full flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 text-left"
                        >
                          <Icon className={`h-4 w-4 ${iconColor}`} />
                          {action.title}
                        </button>
                      </form>
                    );
                  }

                  return (
                    <Link
                      key={action.id}
                      href={action.href || '#'}
                      className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                    >
                      <Icon className={`h-4 w-4 ${iconColor}`} />
                      {action.title}
                    </Link>
                  );
                })}
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
