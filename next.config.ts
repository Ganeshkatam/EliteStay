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
      allowedOrigins: [
        'localhost:3000',
        'confutative-hypersentimentally-mei.ngrok-free.dev',
        '*.ngrok-free.app',
        '*.ngrok-free.dev',
      ],
    },
  },
  images: {
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
};

export default nextConfig;
