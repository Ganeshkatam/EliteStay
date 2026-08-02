import { homepageConfig } from '@/features/home/config/sections';
import { HomeSection } from '@/features/home/components/HomeSection';
import { LazyHomeSection } from '@/features/home/components/LazyHomeSection';
import { Categories } from '@/features/home/components/Categories';
import { PopularLocations } from '@/features/home/components/PopularLocations';

export default async function HomePage() {
  // First section loads immediately for fast initial rendering (LCP)
  const initialConfig = homepageConfig[0];
  const deferredConfigs = homepageConfig.slice(1);

  return (
    <main className="flex min-h-screen flex-col pb-16 pt-0 gap-6">
      <Categories />

      {/* Immediate Initial Section for Instant LCP */}
      {initialConfig && <HomeSection config={initialConfig} />}

      {/* Progressive Velocity-Aware Lazy Sections */}
      {deferredConfigs.map((config) => (
        <LazyHomeSection key={config.id} config={config} />
      ))}

      <PopularLocations />
    </main>
  );
}
