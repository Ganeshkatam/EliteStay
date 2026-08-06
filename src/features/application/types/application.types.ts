export type RentalApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export interface RentalApplication {
  id: string;
  propertyId: string;
  guestId: string;
  status: RentalApplicationStatus;

  moveInDate: string; // YYYY-MM-DD
  leaseDurationMonths: number;

  // Instead of inline, reference the profile
  applicantProfileId: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicantProfile {
  id: string;
  guestId: string;
  employmentStatus: string | null;
  studentStatus: string | null;
  incomeRange: string | null;
  petInformation: string | null;
  guarantorInformation: string | null;
  smokingPreference: string | null;
  createdAt: Date;
  updatedAt: Date;
}
