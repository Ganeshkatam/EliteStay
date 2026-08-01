'use client';

import { useState } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updatePricing } from '../actions/listing-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface PricingFormProps {
  listingId: string;
  initialData: FormValues;
}

export function PricingForm({ listingId, initialData }: PricingFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      ...initialData,
      // If amount is 0, let's leave it blank in the UI to force input
      amount: (initialData.amount > 0
        ? initialData.amount
        : '') as unknown as number,
    },
  });

  const billingPeriod = useWatch({ control, name: 'billing_period' });

  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    setError('');

    try {
      await updatePricing(listingId, data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                  { shouldValidate: true }
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
            <Label htmlFor="maintenance_fee">Maintenance Fee (₹) / month</Label>
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

      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-slate-600 h-12"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12"
        >
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Next
        </Button>
      </div>
    </form>
  );
}
