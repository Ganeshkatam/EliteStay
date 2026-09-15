import { HostAccessService } from '@/features/hosting/services/host-access.service';
import { HostDashboardService } from '@/features/host/services/host-dashboard.service';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { CreateListingButton } from '@/features/host/components/CreateListingButton';
import { createDraftListing } from '@/features/host/actions/listing-actions';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function HostDashboardPage() {
  const { supabase, user } = await HostAccessService.requireOperationalHost();

  const viewModel = await HostDashboardService.getOverview(supabase, user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 animate-in fade-in duration-500 sm:p-6 md:p-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Good morning, {viewModel.firstName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here&apos;s a quick overview of your properties and residents.
          </p>
        </div>
        <form action={createDraftListing}>
          <CreateListingButton />
        </form>
      </div>

      {/* KPI Snapshot - 2x2 Grid */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm font-medium text-slate-500 mb-2">
                Properties
              </p>
              <p className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                {viewModel.metrics.propertiesCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500 mb-2">
                Applications
              </p>
              <p className="text-3xl font-semibold text-slate-900">
                {viewModel.metrics.applicationsCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500 mb-2">
                Occupied
              </p>
              <p className="text-3xl font-semibold text-slate-900">
                {viewModel.metrics.occupiedCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500 mb-2">
                Available
              </p>
              <p className="text-3xl font-semibold text-slate-900">
                {viewModel.metrics.availableCount}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* My Properties List */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          My Properties
        </h2>

        {viewModel.properties.length === 0 ? (
          <Card className="border-slate-200 border-dashed shadow-sm">
            <CardContent className="p-12 text-center flex flex-col items-center justify-center space-y-4">
              <p className="text-slate-500">
                You haven&apos;t added any properties yet.
              </p>
              <form action={createDraftListing}>
                <Button type="submit" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" /> Add Property
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {viewModel.properties.map((property) => (
              <Card
                key={property.id}
                className="border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors gap-4">
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {property.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      ₹{property.rentAmount.toLocaleString('en-IN')} / month
                    </p>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        property.status === 'OCCUPIED'
                          ? 'bg-indigo-50 text-indigo-700'
                          : property.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {property.status === 'OCCUPIED'
                        ? 'Occupied'
                        : property.status === 'PUBLISHED'
                          ? 'Available'
                          : 'Draft'}
                    </span>

                    <Link href={`/host/listings/${property.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-slate-900"
                      >
                        View
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
