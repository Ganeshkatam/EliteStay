import { createHash } from 'crypto';

export interface ExceptionFingerprint {
  fingerprintId: string;
  name: string;
  signature: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  affectedRoutes: Set<string>;
  affectedServices: Set<string>;
}

/**
 * Normalizes error messages to remove dynamic UUIDs, numbers, or specific IDs so identical exceptions group together.
 */
function normalizeErrorMessage(message: string): string {
  return message
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      '<UUID>'
    )
    .replace(/\b\d+\b/g, '<NUM>')
    .replace(/=\(.*?\)/g, '=(<VAL>)')
    .replace(/'[^']*'/g, "'<STR>'");
}

export class ExceptionFingerprintRegistry {
  private fingerprints: Map<string, ExceptionFingerprint> = new Map();

  public record(error: unknown, route?: string, service?: string): void {
    const name = error instanceof Error ? error.name : 'UnknownError';
    const message = error instanceof Error ? error.message : String(error);

    const signature = `${name}: ${normalizeErrorMessage(message)}`;
    const fingerprintId = createHash('sha256')
      .update(signature)
      .digest('hex')
      .substring(0, 16);

    const now = new Date().toISOString();

    let fp = this.fingerprints.get(fingerprintId);
    if (!fp) {
      fp = {
        fingerprintId,
        name,
        signature,
        count: 0,
        firstSeen: now,
        lastSeen: now,
        affectedRoutes: new Set<string>(),
        affectedServices: new Set<string>(),
      };
      this.fingerprints.set(fingerprintId, fp);
    }

    fp.count++;
    fp.lastSeen = now;
    if (route) fp.affectedRoutes.add(route);
    if (service) fp.affectedServices.add(service);
  }

  public getFingerprints(): Array<
    Omit<ExceptionFingerprint, 'affectedRoutes' | 'affectedServices'> & {
      affectedRoutes: string[];
      affectedServices: string[];
    }
  > {
    return Array.from(this.fingerprints.values())
      .map((fp) => ({
        ...fp,
        affectedRoutes: Array.from(fp.affectedRoutes),
        affectedServices: Array.from(fp.affectedServices),
      }))
      .sort((a, b) => b.count - a.count); // Highest occurrences first
  }
}

export const exceptionFingerprints = new ExceptionFingerprintRegistry();
