'use client';

import { usePathname } from 'next/navigation';
import { Container } from '@/components/layout/Container';

export function GuestFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith('/users')) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-border bg-muted/20">
      <Container>
        <div className="flex h-16 items-center justify-between py-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} EliteStay, Inc.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">
              Terms
            </a>
            <a href="#" className="hover:underline">
              Privacy
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
