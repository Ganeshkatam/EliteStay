import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getBuildIdentifier(): string {
  // 1. Check explicit environment version or commit SHA
  if (process.env.NEXT_PUBLIC_APP_VERSION) {
    return process.env.NEXT_PUBLIC_APP_VERSION;
  }
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA) {
    return process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  }

  // 2. Try reading Next.js BUILD_ID generated at build time
  try {
    const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID');
    if (fs.existsSync(buildIdPath)) {
      const buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
      if (buildId) return buildId;
    }
  } catch {
    // Ignore filesystem read errors in serverless environments
  }

  // 3. Fallback to deployment ID or static fallback
  return (
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.BUILD_ID ||
    'v1.0.0-production'
  );
}

const CURRENT_VERSION = getBuildIdentifier();

export async function GET() {
  return NextResponse.json(
    {
      version: CURRENT_VERSION,
      timestamp: Date.now(),
      status: 'ok',
    },
    {
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}
