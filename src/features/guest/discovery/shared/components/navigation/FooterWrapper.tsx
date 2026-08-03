'use client';

import { usePathname } from 'next/navigation';

export function FooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Only show footer on the exact homepage
  if (pathname !== '/') {
    return null;
  }

  return <>{children}</>;
}
