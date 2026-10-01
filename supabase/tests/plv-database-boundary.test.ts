import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

try {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      const val = rest
        .join('=')
        .trim()
        .replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
} catch {
  // Ignore env read failures
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

const hasRealSupabaseConfig =
  SUPABASE_URL.startsWith('http') &&
  !SUPABASE_URL.includes('mock.supabase.co') &&
  SUPABASE_ANON_KEY.length > 20 &&
  SUPABASE_ANON_KEY !== 'mock-supabase-publishable-key';

const describeDatabase = hasRealSupabaseConfig ? describe : describe.skip;

describeDatabase(
  'Phase 5 — Database Boundary & Security PLV Suite (PLV-01 - PLV-05)',
  () => {
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });

    it('PLV-01 - Anonymous guest queries on listings table only receive published listings', async () => {
      const { data, error } = await anonClient
        .from('listings')
        .select('id, title, status')
        .neq('status', 'published');

      // Either data is empty or filtered out by RLS
      if (!error) {
        expect(data?.length ?? 0).toBe(0);
      }
    });

    it('PLV-02 - Anonymous users cannot inspect private compliance columns on host_profiles', async () => {
      const { data, error } = await anonClient
        .from('host_profiles')
        .select(
          'id, user_id, bank_name, bank_account_last4, tax_identifier_last4, kyc_document_ref'
        );

      // RLS default deny or empty data for unauthenticated callers
      if (!error) {
        expect(data?.length ?? 0).toBe(0);
      }
    });

    it('PLV-03 - RPC publish_listing rejects unauthenticated invocation with 401/error', async () => {
      const { data, error } = await anonClient.rpc('publish_listing', {
        p_listing_id: '00000000-0000-0000-0000-000000000000',
      });

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it('PLV-04 - Direct INSERT/UPDATE trying to bypass publish_listing to set published status is rejected', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000099';
      const { error } = await anonClient.from('listings').insert({
        id: fakeId,
        title: 'Bypass Attempt',
        status: 'published',
      });

      // Insertion blocked by RLS / triggers
      expect(error).not.toBeNull();
    });

    it('PLV-05 - Anonymous users cannot query host_policy_acceptances', async () => {
      const { data, error } = await anonClient
        .from('host_policy_acceptances')
        .select('*');

      if (!error) {
        expect(data?.length ?? 0).toBe(0);
      }
    });
  }
);
