import { GuestService } from '@/features/guest/services/guest.service';
import { GuestHomeWorkspace } from '@/features/guest/discovery/home/components/GuestHomeWorkspace';
import { observeServerComponent } from '@/lib/observability/instrumentation/react-observer';

export default async function HomePage() {
  return observeServerComponent('HomePage', async () => {
    const viewModel = await GuestService.getHomeData();

    return (
      <main className="flex min-h-screen flex-col">
        <GuestHomeWorkspace viewModel={viewModel} />
      </main>
    );
  });
}
