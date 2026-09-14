import { cn } from '@/lib/utils';

import { Logo } from './Logo';
import { UserMenu } from './UserMenu';
import { HostToggle } from './HostToggle';
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

  return (
    <>
      <div
        className={cn(
          'flex flex-none items-center justify-start motion-transform origin-left ease-premium',
          isExpanded
            ? 'md:scale-100 scale-90 sm:scale-100'
            : 'scale-90 sm:scale-100'
        )}
      >
        <Logo />
      </div>

      {variant !== 'host' && variant !== 'dashboard' && (
        <div
          className={cn(
            'flex flex-1 items-center justify-center w-full min-w-0 mx-1.5 sm:mx-2 motion-layout ease-premium',
            isExpanded ? 'md:translate-y-[88px] translate-y-0' : 'translate-y-0'
          )}
        >
          {/* On mobile (<md), always render compact GlobalSearch docked in the top bar */}
          <div className="w-full flex justify-center md:hidden">
            <GlobalSearch variant="compact" popularCities={popularCities} />
          </div>
          {/* On desktop (md+), switch between hero and compact based on isExpanded */}
          <div className="w-full hidden md:flex justify-center">
            <GlobalSearch
              variant={isExpanded ? 'hero' : 'compact'}
              popularCities={popularCities}
            />
          </div>
        </div>
      )}

      <div className="flex flex-none items-center justify-end space-x-1.5 sm:space-x-3">
        {user && <HostToggle isHost={isHost} variant={variant} />}
        <UserMenu user={user} profile={profile} variant={variant} />
      </div>
    </>
  );
}
