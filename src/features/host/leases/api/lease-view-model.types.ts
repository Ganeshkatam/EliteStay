import { Lease, LeaseStatus } from '@/features/tenancy/lease/types/lease.types';
import { SecurityDeposit } from '@/features/tenancy/deposit/types/deposit.types';
import { MoveIn } from '@/features/tenancy/move-in/types/move-in.types';

export interface HostLeaseViewModel {
  id: string;
  status: LeaseStatus;

  // Property Info
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;

  // Tenant Info
  tenantId: string;
  tenantName: string;
  tenantEmail: string;

  // Lease Terms
  startDate: string;
  endDate: string;
  monthlyRentAmount: number;
  securityDepositAmount: number;

  // Related Aggregates
  securityDeposit: SecurityDeposit | null;
  moveIn: MoveIn | null;

  createdAt: string;
}
