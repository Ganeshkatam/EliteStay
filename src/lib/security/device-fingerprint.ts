import { headers } from 'next/headers';
import { createHash } from 'crypto';

export async function generateDeviceFingerprint(): Promise<string> {
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get('user-agent') || 'unknown';
  const acceptLanguage = reqHeaders.get('accept-language') || 'unknown';
  const acceptEncoding = reqHeaders.get('accept-encoding') || 'unknown';

  // Combine stable headers to create a rudimentary device fingerprint
  const rawData = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;

  return createHash('sha256').update(rawData).digest('hex').substring(0, 32);
}
