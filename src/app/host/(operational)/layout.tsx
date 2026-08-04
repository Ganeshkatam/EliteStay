import { HostAccessService } from '@/features/hosting/services/host-access.service';
import { HostSidebar } from '@/features/host/components/HostSidebar';

/**
 * Operational route group layout.
 * Only ACTIVE and PAUSED hosts may access these routes.
 * READY hosts are redirected to create their first listing.
 */
export default async function OperationalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await HostAccessService.requireOperationalHost();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <HostSidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
    </div>
  );
}
