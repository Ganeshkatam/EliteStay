'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';

export function CreateListingButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <PlusCircle className="mr-2 h-4 w-4" />
      )}
      {pending ? 'Creating...' : 'Create Listing'}
    </Button>
  );
}
