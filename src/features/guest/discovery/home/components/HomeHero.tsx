import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  ArrowRight,
  CalendarRange,
  KeyRound,
  Star,
  MapPin,
  Sparkles,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';

export function HomeHero() {
  return (
    <Container className="pt-2 pb-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl border border-slate-800/80">
        {/* Ambient atmospheric glows */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-slate-800/20 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center p-6 sm:p-10 md:p-12 lg:p-14">
          {/* Left Column: Value Prop & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3.5 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur-md shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Verified Long-Term Living & Extended Residencies</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                Find your next{' '}
                <span className="bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  long-term home
                </span>{' '}
                and sanctuary.
              </h2>
              <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-xl">
                Discover fully-furnished studio suites, designer apartments, and
                curated residences tailored for monthly stays, transparent
                leasing, and move-in ready comfort.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/s"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-white/10 transition-all hover:bg-slate-100 hover:shadow-xl hover:scale-[1.02] active:scale-95"
              >
                <span>Explore Residences</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/s?filter=verified"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95"
              >
                <Building2 className="h-4 w-4 text-indigo-300" />
                <span>Featured Collections</span>
              </Link>
            </div>

            {/* Trust Pillars */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    100% Verified
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Inspected homes
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                  <CalendarRange className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    Flexible Leases
                  </div>
                  <div className="text-[11px] text-slate-400">
                    1 to 12+ months
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    Move-In Ready
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Utilities included
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              {/* Decorative background glow behind card */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-indigo-500/30 to-blue-500/20 blur-xl opacity-70" />

              {/* Main Showcase Card */}
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/25">
                {/* Residence Image */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                  <Image
                    src="/images/hero-residence.jpg"
                    alt="Luxury curated long-term studio residence"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                    className="object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/30" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-950/70 border border-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Prime Sanctuary</span>
                  </div>

                  {/* Top Rating Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-slate-950/70 border border-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>4.96</span>
                    <span className="text-slate-400 text-[10px] font-normal">
                      (128)
                    </span>
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-300">
                        <MapPin className="h-3 w-3 text-indigo-400" />
                        <span>Downtown Skyline District</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                        The Metropolitan Penthouse Suite
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Card Footer / Quick Info Bar */}
                <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                      All-Inclusive Monthly
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-lg sm:text-xl font-extrabold text-white">
                        $2,450
                      </span>
                      <span className="text-xs text-slate-400 font-normal">
                        / month
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/s"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-md shadow-indigo-600/30"
                  >
                    <span>View Units</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Floating Bottom Inset Card */}
              <div className="hidden sm:flex absolute -bottom-5 -left-5 items-center gap-3 rounded-xl border border-white/15 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md">
                <div className="h-10 w-10 relative rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <Image
                    src="/images/hero-building.jpg"
                    alt="Building exterior"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="text-xs pr-2">
                  <div className="font-semibold text-white flex items-center gap-1">
                    <span>99.4% Match Rate</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Move-in ready residencies
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
