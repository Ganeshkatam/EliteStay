'use client';

import React, {
  useState,
  useEffect,
  useContext,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { saveLocation } from '../actions/publishing-actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAutosave } from '@/hooks/useAutosave';
import { AutosaveContext } from './PublishingWorkspaceShell';
import { PublishingSection } from '../view-models/listing-publishing.viewmodel';

const formSchema = z.object({
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  locality: z.string().min(1, 'Locality is required'),
  postal_code: z.string().min(5, 'Valid postal code is required'),
  address_line1: z.string().min(5, 'Address is required'),
});

type FormValues = z.infer<typeof formSchema>;

export interface LocationFormProps {
  listingId: string;
  initialData: FormValues;
}

export const LocationForm = forwardRef<PublishingSection, LocationFormProps>(
  function LocationForm({ listingId, initialData }, ref) {
    const [error, setError] = useState('');
    const autosaveCtx = useContext(AutosaveContext);

    const {
      register,
      reset,
      trigger,
      getValues,
      control,
      formState: { errors, isDirty },
    } = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData,
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
          await saveLocation(listingId, vals);
        } catch (err: unknown) {
          setError(
            err instanceof Error ? err.message : 'Failed to save location'
          );
          throw err;
        }
      },
      { debounceMs: 1500 }
    );

    useEffect(() => {
      if (autosaveCtx) {
        autosaveCtx.setStatus(status);
        autosaveCtx.setLastSavedAt(lastSavedAt);
        autosaveCtx.setLastAttemptAt(lastAttemptAt);
      }
    }, [status, lastSavedAt, lastAttemptAt, autosaveCtx]);

    const allValues = useWatch({ control });

    useEffect(() => {
      if (isDirty) {
        triggerAutosave(allValues as FormValues);
      }
    }, [allValues, isDirty, triggerAutosave]);

    useImperativeHandle(ref, () => ({
      async save() {
        await saveLocation(listingId, getValues());
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

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address_line1">Street Address</Label>
            <Input
              id="address_line1"
              placeholder="House number, street name"
              {...register('address_line1')}
              className="h-12"
            />
            {errors.address_line1 && (
              <p className="text-sm text-red-500">
                {errors.address_line1.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g. Bangalore"
                {...register('city')}
                className="h-12"
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="locality">Locality / Neighborhood</Label>
              <Input
                id="locality"
                placeholder="e.g. HSR Layout"
                {...register('locality')}
                className="h-12"
              />
              {errors.locality && (
                <p className="text-sm text-red-500">
                  {errors.locality.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="e.g. Karnataka"
                {...register('state')}
                className="h-12"
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                placeholder="e.g. 560102"
                {...register('postal_code')}
                className="h-12"
              />
              {errors.postal_code && (
                <p className="text-sm text-red-500">
                  {errors.postal_code.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    );
  }
);
