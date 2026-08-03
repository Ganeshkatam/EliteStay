'use client';

import {
  useState,
  useEffect,
  useContext,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { saveAccommodation } from '../actions/publishing-actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAutosave } from '@/hooks/useAutosave';
import { AutosaveContext } from './PublishingWorkspaceShell';
import { PublishingSection } from '../view-models/listing-publishing.viewmodel';

const formSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description too long'),
  accommodation_type_id: z.string().min(1, 'Please select a property type'),
});

type FormValues = z.infer<typeof formSchema>;

export interface AccommodationFormProps {
  listingId: string;
  initialData: FormValues;
  accommodationTypes: { id: string; name: string }[];
}

export const AccommodationForm = forwardRef<
  PublishingSection,
  AccommodationFormProps
>(function AccommodationForm(
  { listingId, initialData, accommodationTypes },
  ref
) {
  const [error, setError] = useState('');
  const autosaveCtx = useContext(AutosaveContext);

  const {
    register,
    control,
    reset,
    trigger,
    getValues,
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
      await saveAccommodation(listingId, vals);
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

  const accommodationTypeId = useWatch({
    control,
    name: 'accommodation_type_id',
  });
  const allValues = useWatch({ control });

  useEffect(() => {
    if (isDirty) {
      triggerAutosave(allValues as FormValues);
    }
  }, [allValues, isDirty, triggerAutosave]);

  useImperativeHandle(ref, () => ({
    async save() {
      await saveAccommodation(listingId, getValues());
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
          <Label htmlFor="title">Listing Title</Label>
          <Input
            id="title"
            placeholder="e.g. Modern PG in HSR Layout for Tech Professionals"
            {...register('title')}
            className="h-12"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accommodation_type_id">Accommodation Type</Label>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-white">
                {accommodationTypes.find((t) => t.id === accommodationTypeId)
                  ?.name || 'Paying Guest'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                Inherited from Host Profile
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500">
              (Read-only)
            </span>
          </div>
          <input type="hidden" {...register('accommodation_type_id')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your property. What makes it unique? What's the neighborhood like?"
            {...register('description')}
            className="min-h-[150px] resize-y"
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>
      </div>
    </form>
  );
});
