export enum AuditEventType {
  LISTING_PUBLISHED = 'ListingPublished',
  LISTING_DELETED = 'ListingDeleted',
  BOOKING_APPROVED = 'BookingApproved',
  HOST_PROFILE_UPDATED = 'HostProfileUpdated',
  PAYOUT_ACCOUNT_CHANGED = 'PayoutAccountChanged',
  STAY_CHECKED_IN = 'StayCheckedIn',
  STAY_CHECKED_OUT = 'StayCheckedOut',
}

export interface AuditRecord {
  id: string;
  eventType: AuditEventType;
  actorId: string;
  targetId?: string;
  timestamp: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}
