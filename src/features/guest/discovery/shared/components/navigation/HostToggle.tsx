import Link from 'next/link';
import { type HeaderVariant } from './useHeaderState';

interface HostToggleProps {
  isHost?: boolean;
  variant?: HeaderVariant;
}

export function HostToggle({ isHost, variant }: HostToggleProps) {
  if (variant === 'host' || variant === 'dashboard') {
    return (
      <Link
        href="/"
        className="hidden sm:inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap"
      >
        Find a home
      </Link>
    );
  }

  if (isHost) {
    return (
      <Link
        href="/host"
        className="hidden sm:inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap"
      >
        Switch to hosting
      </Link>
    );
  }

  return (
    <Link
      href="/host/start"
      className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-colors whitespace-nowrap"
    >
      Become a Host
    </Link>
  );
}
