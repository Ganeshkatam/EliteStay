/*
==================================================
Domain: Host Stay & Resident Operations - Decision Policy
Purpose: Encapsulates host business rules governing check-ins, check-outs, lease extensions, room transfers, and terminations.
==================================================
*/

import { type EnrichedStayRow, type StayAction } from '../types/stay.types';
import { StayLifecyclePolicy } from './StayLifecyclePolicy';

export class StayDecisionPolicy {
  /**
   * Evaluates valid business capabilities and emits actionable operational controls per Refinement #6.
   * Covers: Check-in, Check-out, Extension, Early termination, Room transfer, Unit transfer.
   */
  public static getAvailableActions(row: EnrichedStayRow): StayAction[] {
    const actions: StayAction[] = [];
    const isConcluded = ['checked_out', 'completed', 'terminated'].includes(
      row.status
    );

    if (isConcluded) {
      actions.push({
        id: 'concluded-archive',
        label: 'Tenancy Concluded',
        enabled: false,
        variant: 'outline',
        reasonDisabled: 'Stay record is historically archived.',
      });
      return actions;
    }

    // 1. Check-In capability
    const checkInTransition = StayLifecyclePolicy.canTransitionTo(
      row.status,
      'active'
    );
    if (row.status === 'upcoming') {
      actions.push({
        id: 'confirm-checkin',
        label: 'Confirm Check-In',
        enabled: checkInTransition.allowed,
        variant: 'primary',
        reasonDisabled: checkInTransition.reason,
      });
    }

    // 2. Check-Out capability
    const checkOutTransition = StayLifecyclePolicy.canTransitionTo(
      row.status,
      'checked_out'
    );
    if (['active', 'extended'].includes(row.status)) {
      actions.push({
        id: 'confirm-checkout',
        label: 'Confirm Check-Out',
        enabled: checkOutTransition.allowed,
        variant: 'primary',
        reasonDisabled: checkOutTransition.reason,
      });
    }

    // 3. Lease Extension capability
    const extendTransition = StayLifecyclePolicy.canTransitionTo(
      row.status,
      'extended'
    );
    if (['active', 'extended'].includes(row.status)) {
      actions.push({
        id: 'extend-stay',
        label: 'Extend Lease',
        enabled: extendTransition.allowed,
        variant: 'secondary',
        reasonDisabled: extendTransition.reason,
      });
    }

    // 4. Room / Unit Transfer capability
    if (['active', 'extended'].includes(row.status)) {
      actions.push({
        id: 'transfer-unit',
        label: 'Transfer Room / Unit',
        enabled: true,
        variant: 'outline',
      });
    }

    // 5. Early Termination capability
    const terminateTransition = StayLifecyclePolicy.canTransitionTo(
      row.status,
      'terminated'
    );
    if (['upcoming', 'active', 'extended'].includes(row.status)) {
      actions.push({
        id: 'terminate-stay',
        label: 'Early Termination',
        enabled: terminateTransition.allowed,
        variant: 'danger',
        reasonDisabled: terminateTransition.reason,
      });
    }

    return actions;
  }

  /**
   * Validates if a proposed business action can be executed against the targeted stay.
   */
  public static canExecuteAction(
    row: EnrichedStayRow,
    actionId: string
  ): { allowed: boolean; reason?: string } {
    const actions = this.getAvailableActions(row);
    const target = actions.find((a) => a.id === actionId);

    if (!target) {
      return {
        allowed: false,
        reason: `Action "${actionId}" is not recognized for this stay.`,
      };
    }

    return {
      allowed: target.enabled,
      reason: target.reasonDisabled,
    };
  }
}
