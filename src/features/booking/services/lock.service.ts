import { acquireLock, releaseLock } from '@/lib/redis/locks';
import { LockAcquisitionError } from '@/lib/domain/errors';

export class LockService {
  /**
   * Tries to acquire a distributed lock for a specific property and date range.
   */
  static async acquireBookingLock(
    propertyId: string,
    checkIn: string,
    checkOut: string,
    ttlSeconds: number = 300 // 5 minutes default
  ): Promise<string> {
    const lockKey = `booking:property:${propertyId}:checkIn:${checkIn}:checkOut:${checkOut}`;

    const token = await acquireLock(lockKey, ttlSeconds * 1000);

    if (!token) {
      throw new LockAcquisitionError(
        `Property ${propertyId} is currently being booked by someone else for these dates.`
      );
    }

    return token;
  }

  /**
   * Releases the lock safely using Compare-And-Delete.
   */
  static async releaseBookingLock(
    propertyId: string,
    checkIn: string,
    checkOut: string,
    token: string
  ): Promise<boolean> {
    const lockKey = `booking:property:${propertyId}:checkIn:${checkIn}:checkOut:${checkOut}`;

    await releaseLock(lockKey, token);
    return true;
  }
}
