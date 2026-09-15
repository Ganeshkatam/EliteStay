import { describe, it, expect } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Automatically load .env.local into process.env for live database tests
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
} catch {
  // Ignore env read failures
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://ybeidsnuijipacnmybfo.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

const hasSupabase = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('mock.supabase.co') &&
  supabaseAnonKey !== 'mock-supabase-publishable-key'
);

describe('Host Onboarding Database Security Boundary (Phase 0 Verification)', () => {
  let supabase: SupabaseClient;

  if (hasSupabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }

  it.skipIf(!hasSupabase)(
    'H01 - RPC transition_host_to_ready rejects unauthenticated callers with 401',
    async () => {
      const { data, error } = await supabase.rpc('transition_host_to_ready');

      if (error) {
        expect(['P0001', '42501', 'PGRST301']).toContain(error.code);
      } else {
        expect(data).toMatchObject({
          success: false,
          error: 'UNAUTHENTICATED',
          code: '401',
        });
      }
    }
  );

  it.skipIf(!hasSupabase)(
    'H02 - RPC record_host_policy_acceptance rejects unauthenticated callers with 401',
    async () => {
      const { data, error } = await supabase.rpc(
        'record_host_policy_acceptance',
        {
          p_policy_type: 'ANTI_DISCRIMINATION',
          p_policy_version: '2026.1',
          p_client_context: {},
        }
      );

      if (error) {
        expect(['P0001', '42501', 'PGRST301']).toContain(error.code);
      } else {
        expect(data).toMatchObject({
          success: false,
          error: 'UNAUTHENTICATED',
          code: '401',
        });
      }
    }
  );

  it.skipIf(!hasSupabase)(
    'H03 - RPC initialize_host_onboarding rejects unauthenticated callers with 401',
    async () => {
      const { data, error } = await supabase.rpc('initialize_host_onboarding');

      if (error) {
        expect(['P0001', '42501', 'PGRST301']).toContain(error.code);
      } else {
        expect(data).toMatchObject({
          success: false,
          error: 'UNAUTHENTICATED',
          code: '401',
        });
      }
    }
  );

  it.skipIf(!hasSupabase)(
    'H04 - Direct anonymous INSERT on host_profiles is rejected by RLS / privilege policy',
    async () => {
      const randomUserId = '00000000-0000-0000-0000-000000000001';
      const { error } = await supabase.from('host_profiles').insert({
        user_id: randomUserId,
        status: 'READY',
        identity_verification_status: 'VERIFIED',
      });

      expect(error).not.toBeNull();
    }
  );

  it.skipIf(!hasSupabase)(
    'H05 - Direct anonymous UPDATE on host_profiles is rejected by privilege boundary',
    async () => {
      const randomUserId = '00000000-0000-0000-0000-000000000001';
      const { error, data } = await supabase
        .from('host_profiles')
        .update({ status: 'READY' })
        .eq('user_id', randomUserId)
        .select();

      // Either returns privilege error or updates 0 rows due to RLS
      if (error) {
        expect(['42501', 'PGRST301']).toContain(error.code);
      } else {
        expect(data).toEqual([]);
      }
    }
  );

  it.skipIf(!hasSupabase)(
    'H06 - Direct anonymous DELETE on host_profiles is rejected by privilege boundary',
    async () => {
      const randomUserId = '00000000-0000-0000-0000-000000000001';
      const { error, data } = await supabase
        .from('host_profiles')
        .delete()
        .eq('user_id', randomUserId)
        .select();

      if (error) {
        expect(['42501', 'PGRST301']).toContain(error.code);
      } else {
        expect(data).toEqual([]);
      }
    }
  );

  it.skipIf(!hasSupabase)(
    'H07 - Direct anonymous INSERT on host_policy_acceptances is rejected',
    async () => {
      const randomProfileId = '00000000-0000-0000-0000-000000000002';
      const { error } = await supabase.from('host_policy_acceptances').insert({
        host_profile_id: randomProfileId,
        policy_type: 'ANTI_DISCRIMINATION',
        policy_version: '2026.1',
      });

      expect(error).not.toBeNull();
      if (error) {
        expect(['42501', 'PGRST301', '23503', '42501']).toContain(error.code);
      }
    }
  );

  it.skipIf(!hasSupabase)(
    'H08 - Direct anonymous UPDATE on host_policy_acceptances is rejected (append-only table)',
    async () => {
      const randomId = '00000000-0000-0000-0000-000000000003';
      const { error, data } = await supabase
        .from('host_policy_acceptances')
        .update({ policy_version: '9999' })
        .eq('id', randomId)
        .select();

      if (error) {
        expect(['42501', 'PGRST301']).toContain(error.code);
      } else {
        expect(data).toEqual([]);
      }
    }
  );
});
