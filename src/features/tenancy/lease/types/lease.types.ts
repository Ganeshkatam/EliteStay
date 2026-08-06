export type LeaseStatus =
  | 'DRAFT'
  | 'GENERATED'
  | 'ISSUED'
  | 'SIGNED'
  | 'ACTIVE'
  | 'RENEWED'
  | 'EXPIRED'
  | 'TERMINATED';

export interface LeaseStructuredData {
  specialConditions?: string[];
  houseRules?: string[];
  utilitiesIncluded?: string[];
  noticePeriodDays?: number;
  paymentDayOfMonth?: number;
}

export interface Lease {
  id: string;
  reservationId: string;
  tenantId: string;
  status: LeaseStatus;
  startDate: string; // ISO Date (YYYY-MM-DD)
  endDate: string; // ISO Date (YYYY-MM-DD)
  monthlyRentAmount: number;
  securityDepositAmount: number;
  structuredData: LeaseStructuredData;
  documentUrl?: string | null;
  currentVersionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LeaseVersionChangeReason = 'INITIAL' | 'RENEWAL' | 'AMENDMENT';

export interface LeaseVersion {
  id: string;
  leaseId: string;
  versionNumber: number;
  startDate: string;
  endDate: string;
  monthlyRentAmount: number;
  securityDepositAmount: number;
  structuredData: LeaseStructuredData;
  changeReason: LeaseVersionChangeReason | null;
  createdBy: string | null;
  createdAt: string;
}
