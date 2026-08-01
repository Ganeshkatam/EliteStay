import { homepageConfig } from '@/features/home/config/sections';
import { HomeSection } from '@/features/home/components/HomeSection';
import { Categories } from '@/features/home/components/Categories';
import { PopularLocations } from '@/features/home/components/PopularLocations';
import { MapPreview } from '@/features/home/components/MapPreview';

export default async function HomePage() {
  return (
    <main className="flex min-h-screen flex-col pb-16 pt-0 gap-6">
      <PopularLocations />
      <Categories />
      {/* Dynamic Discovery Engine */}
      {homepageConfig.map((config) => (
        <HomeSection key={config.id} config={config} />
      ))}
      <MapPreview />
    </main>
  );
}
