import { HostAccessService } from '@/features/hosting/services/host-access.service';
import { HostSidebar } from '@/features/host/components/HostSidebar';

/**
 * Host profile route group layout.
 * Requires an existing host profile but doesn't care about operational status.
 * Used for: profile, settings, payouts, business pages.
 */
export default async function HostProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await HostAccessService.requireHostProfile();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <HostSidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
    </div>
  );
}
