import { createClient } from '@/lib/supabase/server';
import { HostOperationsService } from '@/features/host/services/host-operations.service';
import { HostRepository } from '@/features/host/repositories/host.repository';
import { CalendarWorkspace } from '@/features/host/components/CalendarWorkspace';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const metadata = {
  title: 'Calendar Workspace - Host - EliteStay',
};

export default async function HostCalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const listings = await HostRepository.getListings(supabase, user.id);
  const dropdownListings = listings.map((l) => ({ id: l.id, title: l.title }));

  const viewModel = await HostOperationsService.getOperationsTimeline(
    supabase,
    user.id
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Calendar Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your long-term availability, move-ins, and maintenance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white">
            Manage Sync
          </Button>
          <Button className="bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" />
            Add Block
          </Button>
        </div>
      </div>

      <CalendarWorkspace listings={dropdownListings} viewModel={viewModel} />
    </div>
  );
}
