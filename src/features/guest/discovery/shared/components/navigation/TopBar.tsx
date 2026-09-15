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
    <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between">
      {/* Top Bar Row: Logo on left, User Actions on right on mobile */}
      <div className="flex items-center justify-between w-full md:w-auto h-12 md:h-full">
        <div className="flex flex-none items-center justify-start motion-transform origin-left ease-premium">
          <Logo />
        </div>

        {/* Mobile-only User Actions on top row */}
        <div className="flex md:hidden flex-none shrink-0 items-center justify-end space-x-1.5">
          {user && <HostToggle isHost={isHost} variant={variant} />}
          <UserMenu user={user} profile={profile} variant={variant} />
        </div>
      </div>

      {/* Desktop Search (Center of single row) */}
      {variant !== 'host' && variant !== 'dashboard' && (
        <div
          className={cn(
            'hidden md:flex flex-1 items-center justify-center w-full min-w-0 mx-2 motion-layout ease-premium',
            isExpanded
              ? 'relative translate-y-[88px]'
              : 'relative translate-y-0'
          )}
        >
          <div className="w-full flex justify-center">
            <GlobalSearch
              variant={isExpanded ? 'hero' : 'compact'}
              popularCities={popularCities}
            />
          </div>
        </div>
      )}

      {/* Desktop-only User Actions (Right side of single row) */}
      <div className="hidden md:flex flex-none shrink-0 items-center justify-end space-x-2">
        {user && <HostToggle isHost={isHost} variant={variant} />}
        <UserMenu user={user} profile={profile} variant={variant} />
      </div>

      {/* Mobile Search Row (Row 2, structured below top row, zero overlapping) */}
      {variant !== 'host' && variant !== 'dashboard' && (
        <div className="w-full flex md:hidden justify-center pt-1 pb-1">
          <GlobalSearch variant="compact" popularCities={popularCities} />
        </div>
      )}
    </div>
  );
}
