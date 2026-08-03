import { headers } from 'next/headers';

export async function getClientIp(): Promise<string> {
  const reqHeaders = await headers();
  // Try reading standard headers used by Vercel and proxies
  const forwardedFor = reqHeaders.get('x-forwarded-for');
  const realIp = reqHeaders.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return '127.0.0.1'; // Fallback for local development
}
