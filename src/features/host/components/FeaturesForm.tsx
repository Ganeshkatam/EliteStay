'use client';

import { useState } from 'react';
import { useForm, Controller, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateFeatures } from '../actions/listing-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  occupancy_type: z.enum(['private', 'shared', 'mixed']),
  furnishing: z.enum(['unfurnished', 'semi_furnished', 'fully_furnished']),
  gender_preference: z.enum(['any', 'male', 'female']),
  max_occupants: z.coerce.number().min(1).max(20),
  amenity_ids: z.array(z.string()),
});

interface FormValues {
  occupancy_type: 'private' | 'shared' | 'mixed';
  furnishing: 'unfurnished' | 'semi_furnished' | 'fully_furnished';
  gender_preference: 'any' | 'male' | 'female';
  max_occupants: number;
  amenity_ids: string[];
}

interface FeaturesFormProps {
  listingId: string;
  initialData: FormValues;
  amenities: { id: string; name: string; category: string }[];
}

export function FeaturesForm({
  listingId,
  initialData,
  amenities,
}: FeaturesFormProps) {
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
    defaultValues: initialData,
  });

  const occupancyType = useWatch({ control, name: 'occupancy_type' });
  const furnishing = useWatch({ control, name: 'furnishing' });
  const genderPreference = useWatch({ control, name: 'gender_preference' });

  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    setError('');

    try {
      await updateFeatures(listingId, data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsPending(false);
    }
  };

  // Group amenities by category for easier rendering
  const amenitiesByCategory = amenities.reduce(
    (acc, amenity) => {
      if (!acc[amenity.category]) acc[amenity.category] = [];
      acc[amenity.category].push(amenity);
      return acc;
    },
    {} as Record<string, typeof amenities>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="occupancy_type">Occupancy Type</Label>
          <Select
            value={occupancyType}
            onValueChange={(val) =>
              setValue('occupancy_type', val as FormValues['occupancy_type'], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select occupancy type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private Room</SelectItem>
              <SelectItem value="shared">Shared Room</SelectItem>
              <SelectItem value="mixed">Mixed Options (PG)</SelectItem>
            </SelectContent>
          </Select>
          {errors.occupancy_type && (
            <p className="text-sm text-red-500">
              {errors.occupancy_type.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_occupants">Maximum Occupants</Label>
          <Input
            id="max_occupants"
            type="number"
            min={1}
            max={20}
            {...register('max_occupants')}
            className="h-12"
          />
          {errors.max_occupants && (
            <p className="text-sm text-red-500">
              {errors.max_occupants.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="furnishing">Furnishing status</Label>
          <Select
            value={furnishing}
            onValueChange={(val) =>
              setValue('furnishing', val as FormValues['furnishing'], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select furnishing..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fully_furnished">Fully Furnished</SelectItem>
              <SelectItem value="semi_furnished">Semi Furnished</SelectItem>
              <SelectItem value="unfurnished">Unfurnished</SelectItem>
            </SelectContent>
          </Select>
          {errors.furnishing && (
            <p className="text-sm text-red-500">{errors.furnishing.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender_preference">Gender Preference</Label>
          <Select
            value={genderPreference}
            onValueChange={(val) =>
              setValue(
                'gender_preference',
                val as FormValues['gender_preference'],
                { shouldValidate: true }
              )
            }
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select gender preference..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any / Co-ed</SelectItem>
              <SelectItem value="male">Male Only</SelectItem>
              <SelectItem value="female">Female Only</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender_preference && (
            <p className="text-sm text-red-500">
              {errors.gender_preference.message}
            </p>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Amenities</h3>

        <div className="space-y-8">
          {Object.entries(amenitiesByCategory).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-medium text-slate-700 capitalize mb-3">
                {category}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((amenity) => (
                  <Controller
                    key={amenity.id}
                    name="amenity_ids"
                    control={control}
                    render={({ field }) => {
                      const isChecked = field.value.includes(amenity.id);
                      return (
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={amenity.id}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, amenity.id]);
                              } else {
                                field.onChange(
                                  field.value.filter(
                                    (val) => val !== amenity.id
                                  )
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={amenity.id}
                            className="font-normal text-slate-600 cursor-pointer"
                          >
                            {amenity.name}
                          </Label>
                        </div>
                      );
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-200">
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
