import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://ybeidsnuijipacnmybfo.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliZWlkc251aWppcGFjbm15YmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjAyNjEsImV4cCI6MjA4NjI5NjI2MX0.g6-J1UfG3GffV9gV07x8-fE_wQ4_761Y_Xj1vCg7nNo';

describe('Phase 5 — Database Boundary & Security PLV Suite (PLV-01 - PLV-05)', () => {
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
});
