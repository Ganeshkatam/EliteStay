import type { NextConfig } from 'next';
import './src/config/env';

function extractHost(urlStr?: string): string | null {
  if (!urlStr) return null;
  try {
    const formatted =
      urlStr.startsWith('http://') || urlStr.startsWith('https://')
        ? urlStr
        : `https://${urlStr}`;
    return new URL(formatted).host;
  } catch {
    return null;
  }
}

const envHosts = [
  extractHost(process.env.NEXT_PUBLIC_SITE_URL),
  extractHost(process.env.NEXT_PUBLIC_APP_URL),
  extractHost(process.env.VERCEL_URL),
  extractHost(process.env.VERCEL_PROJECT_PRODUCTION_URL),
].filter((h): h is string => Boolean(h));

const allowedOrigins = Array.from(
  new Set([
    'localhost',
    'localhost:3000',
    'localhost:3001',
    'localhost:3002',
    '127.0.0.1',
    '127.0.0.1:3000',
    '127.0.0.1:3001',
    '127.0.0.1:3002',
    '*.localhost',
    'elite-stay-one.vercel.app',
    '*.vercel.app',
    ...envHosts,
  ])
);

const nextConfig: NextConfig = {
  allowedDevOrigins: allowedOrigins,
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
      allowedOrigins,
    },
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  headers: async () => [
    {
      source: '/maplibre/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};

export default nextConfig;
