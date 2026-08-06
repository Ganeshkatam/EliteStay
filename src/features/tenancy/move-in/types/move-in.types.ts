export type MoveInStatus =
  'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface MoveIn {
  id: string;
  leaseId: string;
  status: MoveInStatus;
  scheduledDate: string | null;

  // Checklist items
  depositVerified: boolean;
  identityVerified: boolean;
  keysIssued: boolean;
  conditionReportSigned: boolean;
  inventoryCompleted: boolean;
  utilityInformationShared: boolean;
  emergencyContactsConfirmed: boolean;

  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * All fields that can be toggled on the move-in checklist.
 */
export type MoveInChecklistField =
  | 'depositVerified'
  | 'identityVerified'
  | 'keysIssued'
  | 'conditionReportSigned'
  | 'inventoryCompleted'
  | 'utilityInformationShared'
  | 'emergencyContactsConfirmed';
