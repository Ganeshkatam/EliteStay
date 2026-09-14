'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Copy, Plus, Trash2, CalendarSync } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function AvailabilitySettings({
  listingId,
  publicId,
  initialFeeds = [],
}: {
  listingId: string;
  publicId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFeeds?: any[];
}) {
  const [feeds, setFeeds] = useState(initialFeeds);
  const [newUrl, setNewUrl] = useState('');
  const [newProvider, setNewProvider] = useState('Airbnb');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const exportUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/listings/${publicId}/ical`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportUrl);
      toast({
        title: 'Copied!',
        description: 'iCal export URL copied to clipboard.',
      });
    } catch (err: unknown) {
      console.error('Failed to copy to clipboard', err);
      toast({
        title: 'Failed to copy',
        description: 'Please copy the URL manually.',
        variant: 'destructive',
      });
    }
  };

  const handleAddFeed = async () => {
    if (!newUrl) return;
    setIsAdding(true);

    const { data, error } = await supabase
      .from('ical_feeds')
      .insert({
        listing_id: listingId,
        feed_url: newUrl,
        provider: newProvider,
        sync_direction: 'import',
      })
      .select()
      .single();

    setIsAdding(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add calendar feed.',
        variant: 'destructive',
      });
      return;
    }

    setFeeds([...feeds, data]);
    setNewUrl('');
    toast({
      title: 'Success',
      description: 'Calendar feed added successfully.',
    });
  };

  const handleDeleteFeed = async (id: string) => {
    const { error } = await supabase.from('ical_feeds').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete calendar feed.',
        variant: 'destructive',
      });
      return;
    }

    setFeeds(feeds.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Export Section */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Export Calendar
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Copy this URL to sync your EliteStay availability with other platforms
          like Airbnb or Booking.com.
        </p>
        <div className="flex gap-2">
          <Input
            readOnly
            value={exportUrl}
            className="bg-gray-50 text-gray-600"
          />
          <Button variant="outline" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Import Calendars
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Add iCal links from other platforms to automatically block dates on
          EliteStay.
        </p>

        {feeds.length > 0 && (
          <div className="space-y-3 mb-6">
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {feed.provider}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-xs sm:max-w-md">
                    {feed.feed_url}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <CalendarSync className="h-3 w-3 mr-1" />
                    {feed.last_success_at
                      ? `Last synced: ${new Date(feed.last_success_at).toLocaleDateString()}`
                      : 'Pending sync'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFeed(feed.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="w-full sm:w-1/3">
            <Label htmlFor="provider" className="mb-1.5 block">
              Provider
            </Label>
            <Select value={newProvider} onValueChange={setNewProvider}>
              <SelectTrigger id="provider" className="h-9 w-full">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Airbnb">Airbnb</SelectItem>
                <SelectItem value="Booking.com">Booking.com</SelectItem>
                <SelectItem value="VRBO">VRBO</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-2/3">
            <Label htmlFor="url">Calendar URL (iCal)</Label>
            <Input
              id="url"
              placeholder="https://..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>
          <Button
            onClick={handleAddFeed}
            disabled={isAdding || !newUrl}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
