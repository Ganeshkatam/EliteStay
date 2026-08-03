export enum ReservationState {
  DRAFT = 'DRAFT',
  AVAILABILITY_CHECKED = 'AVAILABILITY_CHECKED',
  PRICE_LOCKED = 'PRICE_LOCKED',
  GUEST_DETAILS_COMPLETED = 'GUEST_DETAILS_COMPLETED',
  AWAITING_AUTH = 'AWAITING_AUTH',
  READY_FOR_BOOKING = 'READY_FOR_BOOKING',
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  messageToHost?: string;
}

export interface ReservationIntent {
  intentId: string;
  listingId: string;
  moveInDate: Date | null;
  duration: number | null; // in months
  guestDetails: GuestDetails | null;
}

export interface PriceQuote {
  rent: number;
  deposit: number;
  maintenanceFee: number;
  platformFee: number;
  totalUpfront: number;
  generatedAt: string;
  expiresAt: string;
}

export interface AvailabilityResult {
  isAvailable: boolean;
  reasons: string[]; // empty if available
  constraints: {
    minDuration: number | null;
    maxDuration: number | null;
    availableFrom: Date | null;
    maxOccupancy: number | null;
  };
}
