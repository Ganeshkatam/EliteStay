import { Suspense } from 'react';
import { homepageConfig } from '@/features/guest/discovery/home/config/sections';
import { HomeSection } from '@/features/guest/discovery/home/components/HomeSection';
import { Categories } from '@/features/guest/discovery/home/components/Categories';
import { PopularLocations } from '@/features/guest/discovery/home/components/PopularLocations';
import { Container } from '@/components/layout/Container';

interface GuestHomeWorkspaceProps {
  viewModel: { title: string };
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
 * Every section is an async Server Component wrapped in its own Suspense boundary.
 * This means:
 * - Zero client-side fetch() calls (no /api/home/sections round-trips)
 * - Zero proxy overhead (direct function calls on the server)
 * - Sections stream independently as they resolve via React Suspense streaming
 * - The page shell renders instantly, sections fill in as data arrives
 */
export function GuestHomeWorkspace({}: GuestHomeWorkspaceProps) {
  return (
    <div className="flex flex-col pb-16 pt-0 gap-6 w-full">
      <Suspense fallback={<CategoriesSkeleton />}>
        <Categories />
      </Suspense>

      {/* All sections stream independently via per-section Suspense boundaries */}
      {homepageConfig.map((config) => (
        <Suspense key={config.id} fallback={<SectionSkeleton />}>
          <HomeSection config={config} />
        </Suspense>
      ))}

      <Suspense fallback={<LocationsSkeleton />}>
        <PopularLocations />
      </Suspense>
    </div>
  );
}
