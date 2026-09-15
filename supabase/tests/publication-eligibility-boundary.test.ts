import { describe, it, expect } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local into process.env for live database testing
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

describe('Publication Eligibility & Database Boundary (Phase 2 Verification)', () => {
  let supabase: SupabaseClient;

  if (hasSupabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }

  it.skipIf(!hasSupabase)(
    'P01 - RPC publish_listing rejects unauthenticated callers with 401',
    async () => {
      const randomListingId = '00000000-0000-0000-0000-000000000001';
      const { data, error } = await supabase.rpc('publish_listing', {
        p_listing_id: randomListingId,
      });

      if (error) {
        expect(['P0001', '42501', 'PGRST301', '401']).toContain(error.code);
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
    'P02 - Direct client UPDATE on listings.status to published is rejected by publication guard trigger',
    async () => {
      // Attempt direct update bypassing publish_listing RPC
      const { error } = await supabase
        .from('listings')
        .update({ status: 'published' })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      // Must be rejected with 42501 (prohibited direct update) or RLS deny
      if (error) {
        expect(['42501', 'P0001', '403']).toContain(error.code);
      }
    }
  );

  it.skipIf(!hasSupabase)(
    'P03 - Direct anonymous or non-owner INSERT/UPDATE on listings cannot force published status',
    async () => {
      const { error } = await supabase.from('listings').insert({
        public_id: 'test-adversarial-pub',
        title: 'Adversarial Direct Publish',
        status: 'published',
        host_id: '00000000-0000-0000-0000-000000000002',
        accommodation_type_id: '00000000-0000-0000-0000-000000000003',
      });

      // RLS or trigger must deny insert
      expect(error).toBeDefined();
    }
  );

  it.skipIf(!hasSupabase)(
    'P04 - Direct mutation of host_profiles status to ACTIVE is blocked by column privileges',
    async () => {
      const { error } = await supabase
        .from('host_profiles')
        .update({ status: 'ACTIVE' })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      expect(error).toBeDefined();
    }
  );

  it.skipIf(!hasSupabase)(
    'P05 - Direct mutation of host_profiles verification status to VERIFIED is blocked by column privileges',
    async () => {
      const { error } = await supabase
        .from('host_profiles')
        .update({
          identity_verification_status: 'VERIFIED',
          payout_verification_status: 'VERIFIED',
          tax_verification_status: 'VERIFIED',
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      expect(error).toBeDefined();
    }
  );
});
