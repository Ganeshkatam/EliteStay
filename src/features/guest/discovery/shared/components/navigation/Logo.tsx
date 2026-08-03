import Link from 'next/link';
import { Tent } from 'lucide-react';

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 transition-opacity hover:opacity-80"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Tent className="h-5 w-5" />
      </div>
      <span className="hidden font-bold tracking-tight text-foreground sm:inline-block">
        EliteStay
      </span>
    </Link>
  );
}
