import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { type User } from '@supabase/supabase-js';
import { type SupabaseClient } from '@supabase/supabase-js';
import { type HostProfileRow, type HostStatus } from '../types/hosting.types';

/*
==================================================
Domain: Host Access Service
Purpose: Centralized capability-based authorization gateway for the Host bounded context.

Authentication answers: "Who are you?"
Host capability answers: "Do you have a host_profile?"
Host status answers: "Which parts of the host platform may you access?"

Route-group layouts enforce access once per section.
Server actions independently enforce the same capability checks.
==================================================
*/

/** Statuses that grant full operational access to the Host platform. */
const OPERATIONAL_STATUSES: ReadonlySet<HostStatus> = new Set([
  'ACTIVE',
  'PAUSED',
]);

/**
 * Reusable context type for the entire Host bounded context.
 * Every host service, action, and repository operates on this context
 * instead of repeatedly resolving authentication and host profile information.
 */
export interface HostContext {
  user: User;
  hostProfile: HostProfileRow;
  supabase: SupabaseClient;
}

export interface HostContextOptional {
  user: User;
  hostProfile: HostProfileRow | null;
  supabase: SupabaseClient;
}

import { cache } from 'react';

/**
 * Fetches the host_profile row for the given user ID.
 * Returns null if no profile exists.
 * Wrapped in React cache to deduplicate queries across layout and page components.
 */
const fetchHostProfile = cache(
  async (
    supabase: SupabaseClient,
    userId: string
  ): Promise<HostProfileRow | null> => {
    const { data, error } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[HostAccessService] Error fetching host profile:', error);
      return null;
    }

    return data as unknown as HostProfileRow | null;
  }
);

/**
 * Centralized authorization gateway for the entire Host bounded context.
 *
 * Methods:
 * - requireOperationalHost()         Route guard for ACTIVE/PAUSED hosts (dashboard, bookings, stays)
 * - requireHostProfile()             Route guard for any host with a profile (profile, settings, payouts)
 * - requireHostCapabilityForAction()  Server action guard (throws, never redirects)
 * - getHostContext()                  Permissive context for onboarding (allows null hostProfile)
 */
export class HostAccessService {
  /**
   * For routes requiring a fully operational host: dashboard, listings, bookings, stays, calendar.
   * Only ACTIVE and PAUSED hosts may access these routes.
   * READY hosts are redirected to create their first listing.
   *
   * Used in: `(operational)/layout.tsx`
   */
  static async requireOperationalHost(): Promise<HostContext> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const hostProfile = await fetchHostProfile(supabase, user.id);

    if (!hostProfile || hostProfile.status === 'NOT_STARTED') {
      redirect('/host/start');
    }

    if (hostProfile.status === 'ONBOARDING') {
      redirect('/host/onboarding');
    }

    if (hostProfile.status === 'READY') {
      // Host completed onboarding but has no operational business yet.
      // Guide them to create and publish their first listing.
      redirect('/host/onboarding?step=ready');
    }

    if (hostProfile.status === 'SUSPENDED') {
      redirect('/host/suspended');
    }

    if (!OPERATIONAL_STATUSES.has(hostProfile.status)) {
      redirect('/host/start');
    }

    return { user, hostProfile, supabase };
  }

  /**
   * For routes that require an existing host profile but don't care about status.
   * Useful for: /host/profile, /host/settings, /host/payouts
   *
   * Used in: `(host-profile)/layout.tsx`
   */
  static async requireHostProfile(): Promise<HostContext> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const hostProfile = await fetchHostProfile(supabase, user.id);

    if (!hostProfile || hostProfile.status === 'NOT_STARTED') {
      redirect('/host/start');
    }

    if (hostProfile.status === 'SUSPENDED') {
      redirect('/host/suspended');
    }

    return { user, hostProfile, supabase };
  }

  /**
   * For server actions that need host verification.
   * Throws errors instead of redirecting (server actions cannot redirect).
   * Requires ACTIVE or PAUSED status.
   */
  static async requireHostCapabilityForAction(): Promise<HostContext> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized: No authenticated session.');
    }

    const hostProfile = await fetchHostProfile(supabase, user.id);

    if (!hostProfile) {
      throw new Error('Host capability required: No host profile exists.');
    }

    if (!OPERATIONAL_STATUSES.has(hostProfile.status)) {
      throw new Error(
        `Host capability required: Host status "${hostProfile.status}" does not permit this operation.`
      );
    }

    return { user, hostProfile, supabase };
  }

  /**
   * For pages that need host context but allow non-operational statuses
   * (e.g., the onboarding page itself).
   * Redirects to /login if unauthenticated, but allows null hostProfile.
   */
  static async getHostContext(): Promise<HostContextOptional> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const hostProfile = await fetchHostProfile(supabase, user.id);

    return { user, hostProfile, supabase };
  }
}
