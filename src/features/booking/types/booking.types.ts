export type ReservationStatus =
  | 'DRAFT'
  | 'VALIDATING'
  | 'VALIDATED'
  | 'LOCKED'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_AUTHORIZED'
  | 'CONFIRMED'
  | 'FAILED'
  | 'VALIDATION_FAILED'
  | 'PAYMENT_FAILED'
  | 'LOCK_EXPIRED'
  | 'BOOKING_EXPIRED'
  | 'SYSTEM_ERROR'
  | 'CANCELLED'
  | 'REFUNDED';

export type RentalApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export type ListingBookingPolicy =
  | 'INSTANT_RESERVATION'
  | 'RENTAL_APPLICATION'
  | 'VIEWING_REQUEST'
  | 'CONTACT_HOST';

export type IntentType =
  'INSTANT_RESERVATION' | 'RENTAL_APPLICATION' | 'VIEWING_REQUEST';

export type BookingChannel = 'web' | 'ios' | 'android' | 'partner';

export interface BookingIntent {
  propertyId: string;
  moveInDate: string; // YYYY-MM-DD
  leaseDurationMonths: number;
  guestsCount: number;
  currency: string;
  locale?: string;
  promotionCode?: string;
  source?: string;
  channel: BookingChannel;
  idempotencyKey: string;

  qualifications?: {
    monthlyBudget?: number;
    employmentStatus?: string;
    studentStatus?: string;
    incomeRange?: string;
    petInformation?: string;
    guarantorInformation?: string;
    smokingPreference?: string;
  };
}

export interface PricingSnapshot {
  version: number;
  pricingEngineVersion: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  discounts: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  taxes: any[];
}

export interface StayReservation {
  id: string;
  propertyId: string;
  guestId: string;

  // Stay Dates & Constraints
  moveInDate: string;
  leaseDurationMonths: number;
  guestsCount: number;

  status: ReservationStatus;

  // Hybrid Pricing Snapshot
  pricing: {
    monthlyRent: number;
    securityDeposit: number;
    maintenanceFee: number;
    utilities: number;
    brokerageFee: number;
    totalInitialPayment: number;
    currency: string;
    snapshotJson: PricingSnapshot;
  };

  paymentIntentId: string | null;

  // Concurrency
  version: number;
  idempotencyKey: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface RentalApplication {
  id: string;
  propertyId: string;
  guestId: string;
  status: RentalApplicationStatus;

  moveInDate: string;
  leaseDurationMonths: number;

  monthlyBudget: number | null;
  employmentStatus: string | null;
  studentStatus: string | null;
  incomeRange: string | null;
  petInformation: string | null;
  guarantorInformation: string | null;
  smokingPreference: string | null;

  createdAt: Date;
  updatedAt: Date;
}
