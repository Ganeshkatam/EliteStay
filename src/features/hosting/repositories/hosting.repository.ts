import { createClient } from '@/lib/supabase/server';
import {
  HostProfileRow,
  UserIdentityContext,
  HostStatus,
} from '../types/hosting.types';

/**
 * Pure persistence layer for the Hosting Bounded Context and Host Profile entity.
 * Strictly adheres to the Repository Rule: returns raw row models without ViewModels.
 */
export class HostingRepository {
  /**
   * Retrieves a host profile by user ID. Returns null if not started.
   */
  public async getHostProfileByUserId(
    userId: string
  ): Promise<HostProfileRow | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('host_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[HostingRepository] Error fetching host profile:', error);
      return null;
    }

    return data as unknown as HostProfileRow | null;
  }

  /**
   * Retrieves basic user profile context from public.profiles and active session for identity audit.
   */
  public async getUserIdentityContext(
    userId: string
  ): Promise<UserIdentityContext | null> {
    const supabase = await createClient();

    const { data: authData } = await supabase.auth.getUser();
    const email = authData.user?.email ?? null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, phone, avatar_storage_path')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) {
      console.error('[HostingRepository] Error fetching user profile:', error);
      return {
        id: userId,
        email,
        displayName: null,
        fullName: null,
        phone: null,
        avatarStoragePath: null,
      };
    }

    return {
      id: userId,
      email,
      displayName: profile.display_name ?? null,
      fullName: profile.full_name ?? null,
      phone: profile.phone ?? null,
      avatarStoragePath: profile.avatar_storage_path ?? null,
    };
  }

  /**
   * Upserts partial updates or verified facts into a host profile row.
   */
  public async upsertHostProfile(
    userId: string,
    updates: Partial<
      Omit<HostProfileRow, 'user_id' | 'created_at' | 'updated_at'>
    >
  ): Promise<HostProfileRow | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('host_profiles')
      .upsert(
        {
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('[HostingRepository] Error upserting host profile:', error);
      throw new Error(`Failed to save host profile facts: ${error.message}`);
    }

    return data as unknown as HostProfileRow | null;
  }

  /**
   * Automatically initializes a host profile record in ONBOARDING state if not already active.
   */
  public async initializeOnboarding(userId: string): Promise<HostProfileRow> {
    const existing = await this.getHostProfileByUserId(userId);
    if (existing && existing.status !== 'NOT_STARTED') {
      return existing;
    }

    const res = await this.upsertHostProfile(userId, {
      status: 'ONBOARDING',
    });

    if (!res) {
      throw new Error('Failed to initialize onboarding host profile');
    }
    return res;
  }

  /**
   * Updates the host profile status directly.
   */
  public async updateStatus(userId: string, status: HostStatus): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('host_profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to update status to ${status}: ${error.message}`);
    }
  }

  /**
   * Retrieves the accommodation type UUID for a given canonical slug ('pg', 'hostel', 'apartment', 'other').
   */
  public async getAccommodationTypeIdBySlug(
    slug: string
  ): Promise<string | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('accommodation_types')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      console.error(
        '[HostingRepository] Error resolving accommodation type slug:',
        error
      );
      return null;
    }
    return (data as unknown as { id: string }).id;
  }

  /**
   * Retrieves the slug and display name for an accommodation type UUID.
   */
  public async getAccommodationTypeInfoById(
    id: string | null
  ): Promise<{ slug: string | null; name: string }> {
    if (!id) return { slug: null, name: 'Not designated' };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('accommodation_types')
      .select('slug, name')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return { slug: null, name: 'Not designated' };
    }
    const record = data as unknown as {
      slug: string | null;
      name: string | null;
    };
    return {
      slug: record.slug ?? null,
      name: record.name ?? 'Specialized Accommodation',
    };
  }
}
