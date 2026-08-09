import { HostAccessService } from '@/features/hosting/services/host-access.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default async function ResidentsPage() {
  const { supabase, user } = await HostAccessService.requireOperationalHost();

  // 1. Get host's properties
  const { data: listings } = await supabase
    .from('listings')
    .select('id, title')
    .eq('host_id', user.id);

  const propertyIds = listings?.map((l) => l.id) || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let leases: any[] = [];

  if (propertyIds.length > 0) {
    // 2. Get active/historical leases for those properties
    const { data } = await supabase
      .from('leases')
      .select(
        `
        id,
        status,
        start_date,
        end_date,
        tenant:profiles!leases_tenant_id_fkey(full_name),
        reservations!inner(property_id)
      `
      )
      .in('reservations.property_id', propertyIds)
      .order('start_date', { ascending: false });

    leases = data || [];
  }

  // Create lookup map
  const propertyMap = new Map(listings?.map((l) => [l.id, l.title]));

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Residents
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your active tenancies and resident relationships.
        </p>
      </div>

      <div className="space-y-4">
        {leases.length === 0 ? (
          <Card className="border-slate-200 border-dashed shadow-sm">
            <CardContent className="p-12 text-center">
              <p className="text-slate-500">
                You don&apos;t have any residents yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          leases.map((lease) => (
            <Card
              key={lease.id}
              className="border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white gap-4">
                <div className="grid sm:grid-cols-4 gap-4 flex-1">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Resident Name
                    </p>
                    <p className="font-medium text-slate-900">
                      {lease.tenant?.full_name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Property
                    </p>
                    <p className="font-medium text-slate-900">
                      {propertyMap.get(lease.reservations.property_id)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Lease Status
                    </p>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        lease.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : lease.status === 'EXPIRED'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {lease.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Move In
                    </p>
                    <p className="font-medium text-slate-900">
                      {lease.start_date
                        ? format(new Date(lease.start_date), 'MMM d, yyyy')
                        : 'TBD'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Button variant="ghost" size="sm" className="text-slate-500">
                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
