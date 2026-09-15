import { Suspense } from 'react';
import { homepageConfig } from '@/features/guest/discovery/home/config/sections';
import { HomeHero } from '@/features/guest/discovery/home/components/HomeHero';
import { HomeSection } from '@/features/guest/discovery/home/components/HomeSection';
import { Categories } from '@/features/guest/discovery/home/components/Categories';
import { PopularLocations } from '@/features/guest/discovery/home/components/PopularLocations';
import { Container } from '@/components/layout/Container';
import { GuestHomeSnapshot } from '../types/home-snapshot.types';

interface GuestHomeWorkspaceProps {
  viewModel: GuestHomeSnapshot;
}

function CategoriesSkeleton() {
  return (
    <Container className="py-2">
      <div className="h-6 w-48 bg-gray-100 rounded-lg mb-4 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[120px] rounded-2xl bg-gray-100 animate-pulse border border-gray-100"
          />
        ))}
      </div>
    </Container>
  );
}

function SectionSkeleton() {
  return (
    <Container className="py-2">
      <div className="h-6 w-56 bg-gray-100 rounded-lg mb-4 animate-pulse" />
      <div className="flex overflow-hidden gap-6 pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-[70vw] sm:w-[240px] md:w-[220px] lg:w-[200px] aspect-square rounded-2xl bg-gray-100 animate-pulse border border-gray-100"
          />
        ))}
      </div>
    </Container>
  );
}

function LocationsSkeleton() {
  return (
    <Container className="py-2">
      <div className="h-6 w-44 bg-gray-100 rounded-lg mb-4 animate-pulse" />
      <div className="flex gap-4 sm:gap-6 overflow-hidden pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[160px] sm:w-[200px] aspect-[4/3] rounded-2xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    </Container>
  );
}

/**
 * GuestHomeWorkspace
 *
 * Renders the homepage from the composite GuestHomeSnapshot read model.
 * All sections, categories, and featured locations receive pre-populated data
 * from the single Redis GET snapshot, eliminating fragmented cache waterfalls.
 */
export function GuestHomeWorkspace({ viewModel }: GuestHomeWorkspaceProps) {
  const sectionsMap = new Map(
    (viewModel.sections || []).map((s) => [s.config.id, s.listings])
  );

  return (
    <div className="flex flex-col pb-16 pt-0 gap-6 w-full">
      <h1 className="sr-only">EliteStay - Premium Accommodation & Living</h1>

      <HomeHero />

      <Suspense fallback={<CategoriesSkeleton />}>
        <Categories categories={viewModel.categories} />
      </Suspense>

      {/* All sections render from the single composite read model */}
      {homepageConfig.map((config) => (
        <Suspense key={config.id} fallback={<SectionSkeleton />}>
          <HomeSection config={config} listings={sectionsMap.get(config.id)} />
        </Suspense>
      ))}

      <Suspense fallback={<LocationsSkeleton />}>
        <PopularLocations locations={viewModel.locations} />
      </Suspense>
    </div>
  );
}
