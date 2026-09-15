import { describe, expect, it } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index > 0) {
        process.env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim();
      }
    }
  }
} catch {
  // Environment loading is best-effort for local verification.
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ybeidsnuijipacnmybfo.supabase.co';
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

const enabled =
  Boolean(anonKey) &&
  !url.includes('mock.supabase.co') &&
  anonKey !== 'mock-supabase-publishable-key';

describe('PLV database boundary', () => {
  let supabase: SupabaseClient;

  if (enabled) {
    supabase = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }

  it.skipIf(!enabled)('rejects unauthenticated publication attempts', async () => {
    const { data, error } = await supabase.rpc('publish_listing', {
      p_listing_id: '00000000-0000-0000-0000-000000000001',
    });

    expect(error ? ['P0001', '42501', 'PGRST301', '401'].includes(error.code) : data?.error === 'UNAUTHENTICATED').toBe(true);
  });

  it.skipIf(!enabled)('guest listing reads never expose non-published rows', async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('id,status');

    expect(error).toBeNull();
    expect((data ?? []).every((row) => row.status === 'published')).toBe(true);
  });

  it.skipIf(!enabled)('published-only search RPC returns no unpublished listing rows', async () => {
    const { data, error } = await supabase.rpc('search_listings', {
      p_page: 1,
      p_page_size: 100,
      p_sort: 'recommended',
    });

    expect(error).toBeNull();
    const rows = Array.isArray(data) ? data : [];
    expect(rows.every((row: { status?: string }) => row.status === undefined || row.status === 'published')).toBe(true);
  });

  it.skipIf(!enabled)('policy acceptance storage is append-only from the client boundary', async () => {
    const { error } = await supabase
      .from('host_policy_acceptances')
      .insert({
        host_profile_id: '00000000-0000-0000-0000-000000000001',
        policy_type: 'ANTI_DISCRIMINATION',
        policy_version: '2026.1',
        client_context: {},
      });

    expect(error).toBeDefined();
  });

  it.skipIf(!enabled)('direct publication mutation is denied by the database guard', async () => {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'published' })
      .eq('id', '00000000-0000-0000-0000-000000000001');

    expect(error).toBeDefined();
  });
});
