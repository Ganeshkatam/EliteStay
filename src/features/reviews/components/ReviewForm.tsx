'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { submitReview } from '../actions/submitReview';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Star } from 'lucide-react';

const formSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(100),
  body: z.string().min(10).max(1000),
});

type FormValues = z.infer<typeof formSchema>;

export function ReviewForm({ stayId, listingId, onSuccess }: { stayId: string, listingId: string, onSuccess?: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 5,
      title: '',
      body: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    const result = await submitReview({
      stayId,
      listingId,
      ...data,
    });

    if (result.error) {
      setError(result.error);
    } else {
      onSuccess?.();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-900">Leave a Review</h4>
        
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-600/10">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        (hoveredStar || field.value) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => field.onChange(star)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <input
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Summarize your experience"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Share details of your stay..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Review
        </Button>
      </form>
    </Form>
  );
}
