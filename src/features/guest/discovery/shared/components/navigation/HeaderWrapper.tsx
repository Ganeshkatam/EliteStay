'use client';

import { usePathname } from 'next/navigation';

export function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/reset-password') ||
    pathname?.startsWith('/verify-email')
  ) {
    return null;
  }

  return <>{children}</>;
}
