export type SecurityDepositStatus =
  | 'PENDING'
  | 'COLLECTED'
  | 'HELD'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'FORFEITED';

export interface SecurityDeposit {
  id: string;
  leaseId: string;
  amount: number;
  status: SecurityDepositStatus;
  collectedAt: string | null;
  releasedAt: string | null;
  releaseReason: string | null;
  createdAt: string;
  updatedAt: string;
}
