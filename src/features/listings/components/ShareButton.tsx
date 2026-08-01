'use client';

import { Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ShareButton({ title }: { title: string }) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;
    
    // Use native Web Share API if available (most mobile devices and Safari)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - EliteStay`,
          url: url,
        });
        return;
      } catch (err) {
        // If user cancelled the native share, just return silently
        if ((err as Error).name === 'AbortError') return;
        // Otherwise fall through to clipboard
      }
    }

    // Fallback to clipboard copy
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'The property link has been copied to your clipboard.',
      });
    } catch (err: any) {
      console.error("Error copying link:", err);
      toast({
        variant: 'destructive',
        title: 'Failed to copy',
        description: 'Could not copy the link to clipboard.',
      });
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <Share className="h-4 w-4" />
      <span className="underline decoration-transparent hover:decoration-gray-700 transition-colors">
        Share
      </span>
    </button>
  );
}
