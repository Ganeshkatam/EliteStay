import React from 'react';
import { Logo } from '../navigation/Logo';
import { UserMenu } from '../navigation/UserMenu';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { GlobalSearch } from '@/features/search/components/GlobalSearch/GlobalSearch';
import { type HeaderVariant } from './useHeaderState';
import { type ExtendedProfile } from '@/types/profile';
import { type User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';

interface TopBarProps {
  variant: HeaderVariant;
  user?: User | null;
  profile?: ExtendedProfile | null;
  isExpanded?: boolean;
}

export function TopBar({ variant, user, profile, isExpanded }: TopBarProps) {
  if (variant === 'auth') {
    return <Logo />;
  }

  return (
    <>
      <div className="flex flex-none items-center justify-start">
        <Logo />
      </div>

      {variant !== 'host' && variant !== 'dashboard' && (
        <div
          className={cn(
            'flex flex-1 items-center justify-center w-full transition-transform duration-220 ease-in-out',
            isExpanded ? 'translate-y-[88px]' : 'translate-y-0'
          )}
        >
          <GlobalSearch variant={isExpanded ? 'hero' : 'compact'} />
        </div>
      )}

      <div className="flex flex-none items-center justify-end space-x-4">
        {user ? (
          <>
            <NotificationBell />
            <UserMenu user={user} profile={profile} variant={variant} />
          </>
        ) : (
          <UserMenu user={user} profile={profile} variant={variant} />
        )}
      </div>
    </>
  );
}
