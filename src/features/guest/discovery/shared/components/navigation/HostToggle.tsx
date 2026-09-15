import Link from 'next/link';
import { Sparkles, Home } from 'lucide-react';
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
        className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-xs backdrop-blur-xs hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 whitespace-nowrap active:scale-95"
      >
        <Home className="h-3.5 w-3.5 text-slate-500" />
        <span>Find a home</span>
      </Link>
    );
  }

  if (isHost) {
    return (
      <Link
        href="/host"
        className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-xs backdrop-blur-xs hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 whitespace-nowrap active:scale-95"
      >
        <Sparkles className="h-3.5 w-3.5 text-rose-500" />
        <span>Switch to hosting</span>
      </Link>
    );
  }

  return (
    <Link
      href="/host/start"
      className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-slate-800 transition-all duration-200 whitespace-nowrap active:scale-95"
    >
      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
      <span>Become a Host</span>
    </Link>
  );
}
