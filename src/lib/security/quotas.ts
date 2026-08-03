export const Quotas = {
  SEARCH_REQUESTS_PER_MINUTE: 100,
  BOOKING_REQUESTS_PER_HOUR: 5,
  LOGIN_ATTEMPTS_PER_HOUR: 10,
  MESSAGES_PER_MINUTE: 30,
  LISTING_CREATION_PER_DAY: 5,
};

export class QuotaManager {
  // Stub for a redis-backed quota tracking system
  public async checkQuota(
    userId: string,
    quotaName: keyof typeof Quotas
  ): Promise<boolean> {
    const limit = Quotas[quotaName];
    // In a real implementation, we would increment a counter in Redis for this user and return true if under limit
    return limit > 0;
  }
}

export const quotaManager = new QuotaManager();
