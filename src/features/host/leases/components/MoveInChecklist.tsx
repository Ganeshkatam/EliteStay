'use client';

import React, { useTransition } from 'react';
import {
  MoveIn,
  MoveInChecklistField,
} from '@/features/tenancy/move-in/types/move-in.types';
import {
  updateMoveInChecklistAction,
  completeMoveInAction,
} from '../actions/host-move-in.actions';
import { CheckSquare, Square, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  moveIn: MoveIn;
  disabled?: boolean;
}

const CHECKLIST_ITEMS: {
  field: MoveInChecklistField;
  label: string;
  description: string;
}[] = [
  {
    field: 'depositVerified',
    label: 'Deposit Verified',
    description: 'Ensure the security deposit has been fully collected.',
  },
  {
    field: 'identityVerified',
    label: 'Identity Verified',
    description: 'Check government ID against the lease agreement.',
  },
  {
    field: 'conditionReportSigned',
    label: 'Condition Report Signed',
    description: 'Both parties have signed the entry condition report.',
  },
  {
    field: 'inventoryCompleted',
    label: 'Inventory Completed',
    description: 'Furniture and fixture inventory has been recorded.',
  },
  {
    field: 'utilityInformationShared',
    label: 'Utility Info Shared',
    description: 'Provided instructions for power, water, internet, etc.',
  },
  {
    field: 'emergencyContactsConfirmed',
    label: 'Emergency Contacts',
    description: 'Confirmed tenant emergency contacts.',
  },
  {
    field: 'keysIssued',
    label: 'Keys Issued',
    description: 'Physical or digital keys have been handed over.',
  },
];

export function MoveInChecklist({ moveIn, disabled }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (field: MoveInChecklistField, currentValue: boolean) => {
    startTransition(async () => {
      const result = await updateMoveInChecklistAction(
        moveIn.id,
        field,
        !currentValue
      );
      if (!result.success) {
        alert('Failed to update checklist item');
      }
    });
  };

  const handleComplete = () => {
    startTransition(async () => {
      const result = await completeMoveInAction(moveIn.id);
      if (result.success) {
        alert('Move-in completed successfully! The property is now occupied.');
      } else {
        alert(result.error || 'Failed to complete move-in');
      }
    });
  };

  const allChecked = CHECKLIST_ITEMS.every(
    (item) => moveIn[item.field as keyof MoveIn] === true
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {CHECKLIST_ITEMS.map(({ field, label, description }) => {
            const isChecked = moveIn[field as keyof MoveIn] === true;
            return (
              <li
                key={field}
                className="p-4 hover:bg-gray-50 flex items-start space-x-3"
              >
                <button
                  type="button"
                  disabled={disabled || isPending}
                  onClick={() => handleToggle(field, isChecked)}
                  className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-indigo-600 focus:outline-none disabled:opacity-50"
                >
                  {isChecked ? (
                    <CheckSquare className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <Square className="h-5 w-5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${isChecked ? 'text-gray-500 line-through' : 'text-gray-900'}`}
                  >
                    {label}
                  </p>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center justify-between pt-4">
        {moveIn.status === 'COMPLETED' ? (
          <div className="flex items-center text-sm text-green-600 font-medium">
            <CheckCircle className="h-5 w-5 mr-1.5" />
            Move-in Completed on{' '}
            {new Date(moveIn.completedAt!).toLocaleDateString()}
          </div>
        ) : (
          <>
            {!allChecked && (
              <div className="flex items-center text-sm text-yellow-600">
                <AlertCircle className="h-4 w-4 mr-1.5" />
                Complete all items to finalize move-in
              </div>
            )}
            <button
              type="button"
              disabled={!allChecked || disabled || isPending}
              onClick={handleComplete}
              className="ml-auto inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Move-In
            </button>
          </>
        )}
      </div>
    </div>
  );
}
