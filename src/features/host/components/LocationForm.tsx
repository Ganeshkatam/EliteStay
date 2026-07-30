/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateLocation } from '../actions/listing-actions';
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
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  locality: z.string().min(1, 'Locality is required'),
  postal_code: z.string().min(5, 'Valid postal code is required'),
  address_line1: z.string().min(5, 'Address is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface LocationFormProps {
  listingId: string;
  initialData: FormValues;
}

export function LocationForm({ listingId, initialData }: LocationFormProps) {
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
      await updateLocation(listingId, data);
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

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="country">Country / Region</Label>
          <Select 
            value={watch('country')} 
            onValueChange={(val) => setValue('country', val, { shouldValidate: true })}
            disabled // Locked to India for V1
          >
            <SelectTrigger className="h-12 bg-slate-50">
              <SelectValue placeholder="Select country..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="India">India</SelectItem>
            </SelectContent>
          </Select>
          {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_line1">Street Address</Label>
          <Input 
            id="address_line1" 
            placeholder="House number, street name" 
            {...register('address_line1')} 
            className="h-12"
          />
          {errors.address_line1 && <p className="text-sm text-red-500">{errors.address_line1.message}</p>}
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
            {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="locality">Locality / Neighborhood</Label>
            <Input 
              id="locality" 
              placeholder="e.g. HSR Layout" 
              {...register('locality')} 
              className="h-12"
            />
            {errors.locality && <p className="text-sm text-red-500">{errors.locality.message}</p>}
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
            {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input 
              id="postal_code" 
              placeholder="e.g. 560102" 
              {...register('postal_code')} 
              className="h-12"
            />
            {errors.postal_code && <p className="text-sm text-red-500">{errors.postal_code.message}</p>}
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
        <Button type="submit" disabled={isPending} className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12">
          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Next
        </Button>
      </div>
    </form>
  );
}

