'use client';

import { useState } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addMonths } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { requestBooking } from '../actions/bookingActions';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PLATFORM } from '@/config/platform';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

const bookingSchema = z.object({
  moveInDate: z.date(),
  duration: z.coerce.number().int().min(1, 'Duration must be at least 1'),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingWidgetProps {
  listingId: string;
  pricing: {
    amount: number;
    currency: string;
    billingPeriod: string;
    securityDeposit: number;
    maintenanceFee: number;
    maintenanceFeePeriod: string | null;
    minimumDuration: number;
  };
}

export function BookingWidget({ listingId, pricing }: BookingWidgetProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(
      bookingSchema
    ) as unknown as Resolver<BookingFormValues>,
    defaultValues: {
      duration: pricing.minimumDuration,
    },
  });

  const duration = useWatch({ control: form.control, name: 'duration' });
  const amountToPay = pricing.amount * (duration || 1);

  const onSubmit = async (data: BookingFormValues) => {
    setError(null);
    const startDate = data.moveInDate;
    const endDate = addMonths(startDate, data.duration);

    const result = await requestBooking({
      listingId,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      months: data.duration,
    });

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setIsSuccess(true);
      // In a real app, we might redirect to a success page or user bookings dashboard
      setTimeout(() => {
        router.push('/users');
      }, 2000);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(PLATFORM.LOCALE, {
      style: 'currency',
      currency: PLATFORM.CURRENCY,
      minimumFractionDigits: 0,
    }).format(amount);

  if (isSuccess) {
    return (
      <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Request Sent!</h3>
        <p className="mt-2 text-sm text-gray-500">
          The host has been notified of your request. You will be redirected to
          your bookings dashboard shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">
          {formatCurrency(pricing.amount)}
        </span>
        <span className="text-gray-500">/ {pricing.billingPeriod}</span>
      </div>
      <div className="mt-1 text-sm text-gray-500">
        Minimum stay: {pricing.minimumDuration} {pricing.billingPeriod}
        {pricing.minimumDuration > 1 ? 's' : ''}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="rounded-xl border border-gray-300 p-3 space-y-4">
            <FormField
              control={form.control}
              name="moveInDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-bold uppercase text-gray-700">
                    Move-in Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          aria-label="Select move-in date"
                          aria-expanded={field.value ? true : false}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        startMonth={new Date()}
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-gray-700">
                    Duration ({pricing.billingPeriod}s)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={pricing.minimumDuration}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && (
            <div
              className="text-sm font-medium text-destructive"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full rounded-xl bg-rose-600 py-6 text-base font-semibold hover:bg-rose-700"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Request to book
          </Button>

          <div className="mt-4 text-center text-sm text-gray-500 pb-4 border-b border-gray-200">
            You won&apos;t be charged yet
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 underline decoration-dashed underline-offset-4">
                Rent ({duration || pricing.minimumDuration}{' '}
                {pricing.billingPeriod}
                {(duration || pricing.minimumDuration) > 1 ? 's' : ''})
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(amountToPay)}
              </span>
            </div>

            {pricing.securityDeposit > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 underline decoration-dashed underline-offset-4">
                  Security Deposit
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(pricing.securityDeposit)}
                </span>
              </div>
            )}

            {pricing.maintenanceFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 underline decoration-dashed underline-offset-4">
                  Maintenance Fee
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(pricing.maintenanceFee)} /{' '}
                  {pricing.maintenanceFeePeriod}
                </span>
              </div>
            )}

            <div className="flex justify-between text-base font-bold pt-3 border-t">
              <span>Total (upfront)</span>
              <span>
                {formatCurrency(amountToPay + pricing.securityDeposit)}
              </span>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
