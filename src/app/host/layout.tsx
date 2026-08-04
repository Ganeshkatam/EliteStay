export const metadata = {
  title: 'Host - EliteStay',
};

/**
 * Minimal root host layout. No sidebar, no auth check.
 * Authorization is enforced by nested route group layouts:
 *   (operational)/layout.tsx  -> requireOperationalHost()
 *   (host-profile)/layout.tsx -> requireHostProfile()
 * Top-level pages (start, onboarding, suspended) have their own access logic.
 */
export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
