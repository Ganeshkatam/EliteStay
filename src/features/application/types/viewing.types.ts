export type ViewingRequestStatus =
  'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface ViewingRequest {
  id: string;
  propertyId: string;
  guestId: string;
  status: ViewingRequestStatus;
  requestedDate: string; // YYYY-MM-DD
  requestedTime: string; // e.g., "14:00"
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
}
