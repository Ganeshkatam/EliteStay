import { randomBytes, createHash } from 'crypto';

export class CSRFProtection {
  public generateToken(): { token: string; hash: string } {
    const token = randomBytes(32).toString('hex');
    const hash = createHash('sha256').update(token).digest('hex');
    return { token, hash };
  }

  public validateToken(token: string, storedHash: string): boolean {
    if (!token || !storedHash) return false;
    const hash = createHash('sha256').update(token).digest('hex');
    return hash === storedHash;
  }
}

export const csrf = new CSRFProtection();
