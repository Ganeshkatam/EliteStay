import { GuestService } from '@/features/guest/services/guest.service';
import { GuestHomeWorkspace } from '@/features/guest/discovery/home/components/GuestHomeWorkspace';

export default async function HomePage() {
  const viewModel = await GuestService.getHomeData();

  return (
    <main className="flex min-h-screen flex-col">
      <GuestHomeWorkspace viewModel={viewModel} />
    </main>
  );
}
