import { cn } from '@/lib/utils';

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

  return (
    <>
      <div
        className={cn(
          'flex flex-none items-center justify-start motion-transform origin-left ease-premium',
          isExpanded ? 'scale-100' : 'scale-90'
        )}
      >
        <Logo />
      </div>

      {variant !== 'host' && variant !== 'dashboard' && (
        <div
          className={cn(
            'flex flex-1 items-center justify-center w-full min-w-0 mx-1.5 sm:mx-2 motion-layout ease-premium',
            isExpanded
              ? 'absolute inset-x-0 bottom-2.5 px-3 sm:px-6 md:px-0 md:relative md:bottom-auto md:translate-y-[88px]'
              : 'relative translate-y-0'
          )}
        >
          {/* On mobile (<md), render search in hero position when expanded or top row when collapsed */}
          <div className="w-full flex justify-center md:hidden">
            {isExpanded ? (
              <GlobalSearch variant="hero" popularCities={popularCities} />
            ) : (
              <GlobalSearch variant="compact" popularCities={popularCities} />
            )}
          </div>
          <div className="w-full hidden md:flex justify-center">
            <GlobalSearch
              variant={isExpanded ? 'hero' : 'compact'}
              popularCities={popularCities}
            />
          </div>
        </div>
      )}

      <div className="flex flex-none shrink-0 items-center justify-end space-x-1 sm:space-x-2">
        {user && <HostToggle isHost={isHost} variant={variant} />}
        <UserMenu user={user} profile={profile} variant={variant} />
      </div>
    </>
  );
}
