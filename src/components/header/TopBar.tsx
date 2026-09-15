import { Logo } from '@/features/guest/discovery/shared/components/navigation/Logo';
import { UserMenu } from '@/features/guest/discovery/shared/components/navigation/UserMenu';
import { HostToggle } from '@/features/guest/discovery/shared/components/navigation/HostToggle';
import { type User } from '@supabase/supabase-js';
import { type HeaderVariant } from './useHeaderState';
import { type ExtendedProfile } from '@/types/profile';
import { GlobalSearch } from '@/features/search/components/GlobalSearch/GlobalSearch';
import { type LocationCity } from '@/features/location/types';

interface TopBarProps {
  variant: HeaderVariant;
  user?: User | null;
  profile?: ExtendedProfile | null;
  isExpanded?: boolean;
  isHost?: boolean;
  popularCities?: LocationCity[];
}

export function TopBar({
  variant,
  user,
  profile,
  isExpanded,
  isHost,
  popularCities = [],
}: TopBarProps) {
  if (variant === 'auth') {
    return <Logo />;
  }

  const showSearch = variant !== 'host' && variant !== 'dashboard';

  // Mobile Expanded view: 2 dedicated rows to prevent overlap
  if (isExpanded) {
    return (
      <div className="flex flex-col w-full h-full justify-between pb-2 md:pb-0">
        {/* Top Row: Logo on left, User Controls on right */}
        <div className="flex items-center justify-between w-full h-[52px] sm:h-[60px] md:h-[76px] relative">
          <div className="flex flex-none items-center justify-start shrink-0">
            <Logo />
          </div>

          {/* Desktop-only Search in Top Row */}
          {showSearch && (
            <div className="hidden md:flex flex-1 items-center justify-center w-full min-w-0 mx-4">
              <GlobalSearch variant="hero" popularCities={popularCities} />
            </div>
          )}

          <div className="flex flex-none shrink-0 items-center justify-end space-x-1.5 sm:space-x-2">
            {user && <HostToggle isHost={isHost} variant={variant} />}
            <UserMenu user={user} profile={profile} variant={variant} />
          </div>
        </div>

        {/* Bottom Row: Mobile-only Search Bar */}
        {showSearch && (
          <div className="w-full flex md:hidden justify-center px-0.5 pt-1 pb-0.5">
            <GlobalSearch variant="compact" popularCities={popularCities} />
          </div>
        )}
      </div>
    );
  }

  // Collapsed view: Single compact row across all screen sizes
  return (
    <div className="flex items-center justify-between w-full h-full gap-1.5 sm:gap-4">
      <div className="flex flex-none items-center justify-start shrink-0">
        <Logo />
      </div>

      {showSearch && (
        <div className="flex flex-1 items-center justify-center w-full min-w-0 mx-1.5 sm:mx-2 max-w-[460px]">
          <GlobalSearch variant="compact" popularCities={popularCities} />
        </div>
      )}

      <div className="flex flex-none shrink-0 items-center justify-end space-x-1 sm:space-x-2">
        {user && <HostToggle isHost={isHost} variant={variant} />}
        <UserMenu user={user} profile={profile} variant={variant} />
      </div>
    </div>
  );
}
