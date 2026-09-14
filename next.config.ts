import type { NextConfig } from 'next';
import './src/config/env';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost:3000',
    'confutative-hypersentimentally-mei.ngrok-free.dev',
    '*.ngrok-free.app',
    '*.ngrok.io',
    '*.ngrok.app',
    '*.ngrok-free.dev',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
      allowedOrigins: [
        'localhost:3000',
        'confutative-hypersentimentally-mei.ngrok-free.dev',
        '*.ngrok-free.app',
        '*.ngrok-free.dev',
      ],
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
