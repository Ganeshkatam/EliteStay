'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfile } from '@/features/auth/actions/profile-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CalendarIcon } from 'lucide-react';
import { type ExtendedProfile } from '@/types/profile';
import { useProfileField } from './ProfileField';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Helper component for small inline forms
function InlineForm({
  defaultValues,
  schema,
  onSubmitData,
  close,
  children,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<any, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmitData: (
    data: any
  ) => Promise<{ error?: { message: string } } | { data: any }>;
  close?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (props: {
    register: any;
    errors: any;
    isPending: boolean;
    watch: any;
    setValue: any;
  }) => React.ReactNode;
}) {
  const {
    register,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const context = useProfileField();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = watch(() => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const isValid = await trigger();
        if (isValid) {
          setIsPending(true);
          setError(null);
          const result = await onSubmitData(getValues());
          setIsPending(false);
          if (result && 'error' in result && result.error) {
            setError(result.error.message);
          }
        }
      }, 800);
    });
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [watch, trigger, getValues, onSubmitData]);

  return (
    <div className="space-y-4">
      {children({ register, errors, isPending, watch, setValue })}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-between items-center pt-2">
        <div className="text-sm font-medium h-5 flex items-center">
          {isPending && (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-500" />
              <span className="text-slate-500">Saving...</span>
            </>
          )}
          {!isPending && isDirty && !error && (
            <span className="text-green-600">Changes saved</span>
          )}
        </div>
        <Button
          type="button"
          className="bg-slate-900 text-white hover:bg-slate-800"
          onClick={() => {
            close?.();
            context?.close();
          }}
        >
          Done
        </Button>
      </div>
    </div>
  );
}

// ---- Personal Info Forms ---- //

export function NameForm({
  profile,
  close,
}: {
  profile: ExtendedProfile;
  close?: () => void;
}) {
  return (
    <InlineForm
      schema={z.object({
        full_name: z.string().min(2, 'Name must be at least 2 characters'),
      })}
      defaultValues={{ full_name: profile.full_name || '' }}
      onSubmitData={(data) =>
        updateProfile(data as unknown as Parameters<typeof updateProfile>[0])
      }
      close={close}
    >
      {({ register, errors }) => (
        <div>
          <label className="block text-sm font-medium mb-1">Legal Name</label>
          <Input {...register('full_name')} placeholder="Legal Name" />
          {errors.full_name && (
            <p className="mt-1 text-sm text-destructive">
              {errors.full_name.message}
            </p>
          )}
          <p className="text-xs text-slate-500 mt-2">
            This is the name on your travel document, which could be a license
            or a passport.
          </p>
        </div>
      )}
    </InlineForm>
  );
}

export function DateOfBirthForm({
  profile,
  close,
}: {
  profile: ExtendedProfile;
  close?: () => void;
}) {
  return (
    <InlineForm
      schema={z.object({ date_of_birth: z.string().optional().nullable() })}
      defaultValues={{ date_of_birth: profile.date_of_birth || '' }}
      onSubmitData={(data) =>
        updateProfile(data as unknown as Parameters<typeof updateProfile>[0])
      }
      close={close}
    >
      {({ watch, setValue }) => {
        const dateStr = watch('date_of_birth');
        const date = dateStr ? new Date(dateStr) : undefined;

        return (
          <div>
            <label className="block text-sm font-medium mb-1">
              Date of Birth
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setValue(
                      'date_of_birth',
                      newDate ? format(newDate, 'yyyy-MM-dd') : null,
                      { shouldDirty: true }
                    );
                  }}
                  defaultMonth={date}
                  captionLayout="dropdown"
                  startMonth={new Date(1900, 0)}
                  endMonth={new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        );
      }}
    </InlineForm>
  );
}

export function GenderForm({
  profile,
  close,
}: {
  profile: ExtendedProfile;
  close?: () => void;
}) {
  return (
    <InlineForm
      schema={z.object({ gender: z.string().optional().nullable() })}
      defaultValues={{ gender: profile.gender || '' }}
      onSubmitData={(data) =>
        updateProfile(data as unknown as Parameters<typeof updateProfile>[0])
      }
      close={close}
    >
      {({ register }) => (
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select
            {...register('gender')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}
    </InlineForm>
  );
}

export function OccupationForm({
  profile,
  close,
}: {
  profile: ExtendedProfile;
  close?: () => void;
}) {
  return (
    <InlineForm
      schema={z.object({ occupation: z.string().optional().nullable() })}
      defaultValues={{ occupation: profile.occupation || '' }}
      onSubmitData={(data) =>
        updateProfile(data as unknown as Parameters<typeof updateProfile>[0])
      }
      close={close}
    >
      {({ register }) => (
        <div>
          <label className="block text-sm font-medium mb-1">Occupation</label>
          <select
            {...register('occupation')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select Occupation</option>
            <option value="student">Student</option>
            <option value="software_engineer">Software Engineer</option>
            <option value="healthcare_professional">
              Healthcare Professional
            </option>
            <option value="education">Education</option>
            <option value="design_creative">Design / Creative</option>
            <option value="finance_accounting">Finance / Accounting</option>
            <option value="marketing_sales">Marketing / Sales</option>
            <option value="entrepreneur_founder">Entrepreneur / Founder</option>
            <option value="freelancer">Freelancer</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}
    </InlineForm>
  );
}

export function BioForm({
  profile,
  close,
}: {
  profile: ExtendedProfile;
  close?: () => void;
}) {
  return (
    <InlineForm
      schema={z.object({
        bio: z
          .string()
          .max(500, 'Bio must be less than 500 characters')
          .optional()
          .nullable(),
      })}
      defaultValues={{ bio: profile.bio || '' }}
      onSubmitData={(data) =>
        updateProfile(data as unknown as Parameters<typeof updateProfile>[0])
      }
      close={close}
    >
      {({ register, errors }) => (
        <div>
          <label className="block text-sm font-medium mb-1">About You</label>
          <textarea
            {...register('bio')}
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Tell future hosts or guests a little about yourself."
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-destructive">
              {errors.bio.message}
            </p>
          )}
        </div>
      )}
    </InlineForm>
  );
}

export function UsernameForm({
  profile,
  close,
}: {
  profile: ExtendedProfile;
  close?: () => void;
}) {
  return (
    <InlineForm
      schema={z.object({
        username: z
          .string()
          .min(3, 'Username must be at least 3 characters')
          .max(30, 'Username must be less than 30 characters')
          .regex(
            /^[a-z0-9_]+$/,
            'Username can only contain lowercase letters, numbers, and underscores'
          )
          .refine(
            (val) =>
              ![
                'admin',
                'root',
                'support',
                'help',
                'host',
                'users',
                'login',
                'signup',
                'settings',
                'notifications',
                'messages',
                'profile',
                'api',
              ].includes(val ?? ''),
            'This username is reserved'
          )
          .optional()
          .nullable(),
      })}
      defaultValues={{ username: profile.username || '' }}
      onSubmitData={(data) =>
        updateProfile(data as unknown as Parameters<typeof updateProfile>[0])
      }
      close={close}
    >
      {({ register, errors }) => (
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-slate-50 text-slate-500 text-sm">
              elitestay.com/u/
            </span>
            <Input
              {...register('username')}
              placeholder="john_smith"
              className="rounded-l-none"
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-destructive">
              {errors.username.message}
            </p>
          )}
        </div>
      )}
    </InlineForm>
  );
}

export function TimezoneForm({
  profile,
  close,
}: {
  profile: ExtendedProfile;
  close?: () => void;
}) {
  // A minimal list of major IANA timezones for V1
  const TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];

  return (
    <InlineForm
      schema={z.object({ timezone: z.string().optional().nullable() })}
      defaultValues={{ timezone: profile.timezone || '' }}
      onSubmitData={(data) =>
        updateProfile(data as unknown as Parameters<typeof updateProfile>[0])
      }
      close={close}
    >
      {({ register }) => (
        <div>
          <label className="block text-sm font-medium mb-1">Timezone</label>
          <select
            {...register('timezone')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select Timezone</option>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      )}
    </InlineForm>
  );
}

// ---- Contact Forms ---- //

export function PhoneForm({
  profile,
  close,
}: {
  profile: ExtendedProfile;
  close?: () => void;
}) {
  return (
    <InlineForm
      schema={z.object({
        phone: z
          .string()
          .regex(/^\+91\d{10}$/, 'Phone must be in format +91XXXXXXXXXX')
          .optional()
          .nullable()
          .or(z.literal('')),
      })}
      defaultValues={{ phone: profile.phone || '' }}
      onSubmitData={(data) =>
        updateProfile(data as unknown as Parameters<typeof updateProfile>[0])
      }
      close={close}
    >
      {({ register, errors }) => (
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <Input {...register('phone')} placeholder="+91XXXXXXXXXX" />
          {errors.phone && (
            <p className="mt-1 text-sm text-destructive">
              {errors.phone.message}
            </p>
          )}
        </div>
      )}
    </InlineForm>
  );
}
