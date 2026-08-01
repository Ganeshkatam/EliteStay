/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateAccommodation } from '../actions/listing-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description too long'),
  accommodation_type_id: z.string().min(1, 'Please select a property type'),
});

type FormValues = z.infer<typeof formSchema>;

interface AccommodationFormProps {
  listingId: string;
  initialData: FormValues;
  accommodationTypes: { id: string; name: string }[];
}

export function AccommodationForm({ listingId, initialData, accommodationTypes }: AccommodationFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    setError('');
    
    try {
      await updateAccommodation(listingId, data);
      // Action redirects to next step on success
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title" 
            placeholder="e.g. Modern PG in HSR Layout for Tech Professionals" 
            {...register('title')} 
            className="h-12"
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accommodation_type_id">Property Type</Label>
          <Select 
            value={watch('accommodation_type_id')} 
            onValueChange={(val) => setValue('accommodation_type_id', val, { shouldValidate: true })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {accommodationTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.accommodation_type_id && <p className="text-sm text-red-500">{errors.accommodation_type_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            placeholder="Describe your property. What makes it unique? What's the neighborhood like?" 
            {...register('description')} 
            className="min-h-[150px] resize-y"
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isPending} className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12">
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Next
        </Button>
      </div>
    </form>
  );
}

