import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://mock.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'mock-supabase-publishable-key',
    },
    alias: {
      '@': resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/setup.ts'],
    },
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'scripts/**',
      'tests/**',
    ],
  },
});
