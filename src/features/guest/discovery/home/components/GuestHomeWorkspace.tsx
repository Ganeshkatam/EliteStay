import { homepageConfig } from '@/features/guest/discovery/home/config/sections';
import { HomeSection } from '@/features/guest/discovery/home/components/HomeSection';
import { LazyHomeSection } from '@/features/guest/discovery/home/components/LazyHomeSection';
import { Categories } from '@/features/guest/discovery/home/components/Categories';
import { PopularLocations } from '@/features/guest/discovery/home/components/PopularLocations';

interface GuestHomeWorkspaceProps {
  viewModel: { title: string };
}

export function GuestHomeWorkspace({}: GuestHomeWorkspaceProps) {
  // First section loads immediately for fast initial rendering (LCP)
  const initialConfig = homepageConfig[0];
  const deferredConfigs = homepageConfig.slice(1);

  return (
    <div className="flex flex-col pb-16 pt-0 gap-6 w-full">
      <Categories />

      {/* Immediate Initial Section for Instant LCP */}
      {initialConfig && <HomeSection config={initialConfig} />}

      {/* Progressive Velocity-Aware Lazy Sections */}
      {deferredConfigs.map((config) => (
        <LazyHomeSection key={config.id} config={config} />
      ))}

      <PopularLocations />
    </div>
  );
}
