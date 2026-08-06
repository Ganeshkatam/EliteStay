import { Lease, LeaseStatus } from '@/features/tenancy/lease/types/lease.types';
import { SecurityDeposit } from '@/features/tenancy/deposit/types/deposit.types';
import { MoveIn } from '@/features/tenancy/move-in/types/move-in.types';

export interface ResidentViewModel {
  // Only the active/most recent lease
  lease: {
    id: string;
    status: LeaseStatus;
    startDate: string;
    endDate: string;
    monthlyRentAmount: number;
    securityDepositAmount: number;
  } | null;

  // Property Information for this lease
  property: {
    id: string;
    title: string;
    address: string;
    hostName: string;
    houseRules: string[];
    specialConditions: string[];
    utilitiesIncluded: string[];
  } | null;

  deposit: SecurityDeposit | null;
  moveIn: MoveIn | null;
}
