import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { observeRepository } from '@/lib/observability';
import { HostSettingsRow } from '../types/settings.types';

export class HostSettingsRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Retrieves host settings. If they don't exist, an upsert is performed
   * to initialize the row with default values and returns the result.
   */
  async getOrUpsertSettings(hostProfileId: string): Promise<HostSettingsRow> {
    return observeRepository(
      'HostSettingsRepository',
      'getOrUpsertSettings',
      'host_settings',
      async () => {
        // Attempt to fetch first
        const { data: existing, error: fetchError } = await this.supabase
          .from('host_settings')
          .select('*')
          .eq('host_profile_id', hostProfileId)
          .single();

        if (!fetchError && existing) {
          return existing as unknown as HostSettingsRow;
        }

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 means zero rows returned, anything else is a real error
          throw new Error(
            `Failed to fetch host settings: ${fetchError.message}`
          );
        }

        // Row doesn't exist, perform an upsert to initialize defaults
        // The ON CONFLICT DO NOTHING / UPDATE logic is handled by Supabase upsert.
        // We only provide the ID, allowing DB defaults to populate the rest.
        const { data: upserted, error: upsertError } = await this.supabase
          .from('host_settings')
          .upsert(
            { host_profile_id: hostProfileId },
            { onConflict: 'host_profile_id' }
          )
          .select('*')
          .single();

        if (upsertError || !upserted) {
          throw new Error(
            `Failed to initialize host settings: ${upsertError?.message}`
          );
        }

        return upserted as unknown as HostSettingsRow;
      }
    );
  }

  async updateSettings(
    hostProfileId: string,
    updates: Partial<
      Omit<HostSettingsRow, 'host_profile_id' | 'created_at' | 'updated_at'>
    >
  ): Promise<HostSettingsRow> {
    return observeRepository(
      'HostSettingsRepository',
      'updateSettings',
      'host_settings',
      async () => {
        const { data, error } = await this.supabase
          .from('host_settings')
          .update(
            updates as Database['public']['Tables']['host_settings']['Update']
          )
          .eq('host_profile_id', hostProfileId)
          .select('*')
          .single();

        if (error || !data) {
          throw new Error(`Failed to update host settings: ${error?.message}`);
        }

        return data as unknown as HostSettingsRow;
      }
    );
  }
}
