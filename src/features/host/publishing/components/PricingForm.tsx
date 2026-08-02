'use client';

import React, {
  useState,
  useEffect,
  useContext,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { savePricing } from '../actions/publishing-actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAutosave } from '@/hooks/useAutosave';
import { AutosaveContext } from './PublishingWorkspaceShell';
import { PublishingSection } from '../view-models/listing-publishing.viewmodel';

const formSchema = z.object({
  amount: z.coerce.number().min(500, 'Price must be at least ₹500'),
  billing_period: z.enum(['day', 'week', 'month', 'semester', 'year']),
  security_deposit: z.coerce.number().min(0),
  maintenance_fee: z.coerce.number().min(0),
});

interface FormValues {
  amount: number;
  billing_period: 'day' | 'week' | 'month' | 'semester' | 'year';
  security_deposit: number;
  maintenance_fee: number;
}

export interface PricingFormProps {
  listingId: string;
  initialData: FormValues;
}

export const PricingForm = forwardRef<PublishingSection, PricingFormProps>(
  function PricingForm({ listingId, initialData }, ref) {
    const [error, setError] = useState('');
    const autosaveCtx = useContext(AutosaveContext);

    const {
      register,
      setValue,
      control,
      reset,
      trigger,
      getValues,
      formState: { errors, isDirty },
    } = useForm<FormValues>({
      resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
      defaultValues: {
        ...initialData,
        amount: (initialData.amount > 0
          ? initialData.amount
          : '') as unknown as number,
      },
    });

    const {
      save: triggerAutosave,
      status,
      lastSavedAt,
      lastAttemptAt,
    } = useAutosave<FormValues>(
      async (vals) => {
        setError('');
        try {
          await savePricing(listingId, vals);
        } catch (err: unknown) {
          setError(
            err instanceof Error ? err.message : 'Failed to save pricing'
          );
          throw err;
        }
      },
      { debounceMs: 1200 }
    );

    useEffect(() => {
      if (autosaveCtx) {
        autosaveCtx.setStatus(status);
        autosaveCtx.setLastSavedAt(lastSavedAt);
        autosaveCtx.setLastAttemptAt(lastAttemptAt);
      }
    }, [status, lastSavedAt, lastAttemptAt, autosaveCtx]);

    const billingPeriod = useWatch({ control, name: 'billing_period' });
    const allValues = useWatch({ control });

    useEffect(() => {
      if (isDirty) {
        triggerAutosave(allValues as FormValues);
      }
    }, [allValues, isDirty, triggerAutosave]);

    useImperativeHandle(ref, () => ({
      async save() {
        await savePricing(listingId, getValues());
      },
      async validate() {
        return await trigger();
      },
      reset() {
        reset(initialData);
      },
      autosave() {
        triggerAutosave(getValues());
      },
    }));

    return (
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {error && (
          <div className="p-4 rounded-md bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Rent Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g. 15000"
                {...register('amount')}
                className="h-12 text-lg font-medium"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_period">Billing Period</Label>
              <Select
                value={billingPeriod}
                onValueChange={(val) =>
                  setValue(
                    'billing_period',
                    val as FormValues['billing_period'],
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select period..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Per Month</SelectItem>
                  <SelectItem value="day">Per Day</SelectItem>
                  <SelectItem value="week">Per Week</SelectItem>
                  <SelectItem value="semester">Per Semester</SelectItem>
                  <SelectItem value="year">Per Year</SelectItem>
                </SelectContent>
              </Select>
              {errors.billing_period && (
                <p className="text-sm text-red-500">
                  {errors.billing_period.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="security_deposit">Security Deposit (₹)</Label>
              <Input
                id="security_deposit"
                type="number"
                placeholder="e.g. 30000"
                {...register('security_deposit')}
                className="h-12"
              />
              <p className="text-xs text-slate-500">
                Fully refundable at the end of the stay.
              </p>
              {errors.security_deposit && (
                <p className="text-sm text-red-500">
                  {errors.security_deposit.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenance_fee">
                Maintenance Fee (₹) / month
              </Label>
              <Input
                id="maintenance_fee"
                type="number"
                placeholder="e.g. 1500"
                {...register('maintenance_fee')}
                className="h-12"
              />
              <p className="text-xs text-slate-500">
                Optional. Leave as 0 if included in rent.
              </p>
              {errors.maintenance_fee && (
                <p className="text-sm text-red-500">
                  {errors.maintenance_fee.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    );
  }
);
