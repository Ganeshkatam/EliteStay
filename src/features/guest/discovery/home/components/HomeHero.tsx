import Link from 'next/link';
import {
  Home,
  ShieldCheck,
  ArrowRight,
  CalendarRange,
  KeyRound,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';

export function HomeHero() {
  return (
    <Container className="pt-4 pb-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-8 sm:px-10 sm:py-12 md:px-12 md:py-14 text-white shadow-xl border border-slate-800/80">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300 backdrop-blur-sm">
            <Home className="h-3.5 w-3.5 text-indigo-400" />
            <span>Long-Term Living & Extended Residencies</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Find your next long-term home and sanctuary.
          </h2>

          <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed">
            Discover verified apartments, studio suites, and premium residences
            crafted for extended stays, seamless monthly leasing, and move-in
            ready comfort.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/s"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition-all hover:bg-slate-100 hover:shadow-lg active:scale-95"
            >
              <span>Explore Residences</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Verified residences</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarRange className="h-4 w-4 text-blue-400" />
                <span>Flexible monthly leases</span>
              </div>
              <div className="flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-indigo-400" />
                <span>Move-in ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
