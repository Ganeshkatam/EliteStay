import { RentalApplicationStatus } from '@/features/application/types/application.types';

export interface HostApplicationViewModel {
  id: string;
  status: RentalApplicationStatus;

  // Listing details
  listing: {
    id: string;
    title: string;
    imageUrl: string | null;
  };

  // Guest & Profile details
  applicant: {
    id: string;
    name: string;
    avatarUrl: string | null;
    employmentStatus: string | null;
    incomeRange: string | null;
    studentStatus: string | null;
    petInformation: string | null;
    guarantorInformation: string | null;
  };

  // Terms
  moveInDate: string;
  leaseDurationMonths: number;

  submittedAt: string;
  expiresAt: string; // Applications might expire if not reviewed

  actions: {
    canApprove: boolean;
    canReject: boolean;
  };
}
