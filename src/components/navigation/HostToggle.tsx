import Link from 'next/link';

interface HostToggleProps {
  isHost?: boolean;
}

export function HostToggle({ isHost }: HostToggleProps) {
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
