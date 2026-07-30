/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { publishListing } from '../actions/listing-actions';
import { Loader2, Rocket } from 'lucide-react';

interface PublishButtonProps {
  listingId: string;
  disabled: boolean;
}

export function PublishButton({ listingId, disabled }: PublishButtonProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');

  const handlePublish = async () => {
    setIsPublishing(true);
    setError('');

    try {
      await publishListing(listingId);
      // Action redirects on success
    } catch (err: any) {
      setError(err.message || 'Failed to publish');
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handlePublish} 
        disabled={disabled || isPublishing}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {isPublishing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Rocket className="mr-2 h-4 w-4" />
        )}
        Publish Listing
      </Button>
      {error && <p className="text-sm text-red-500 max-w-[250px]">{error}</p>}
    </div>
  );
}

