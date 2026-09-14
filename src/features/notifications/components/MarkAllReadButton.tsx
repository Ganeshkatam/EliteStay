'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCheck, Loader2 } from 'lucide-react';
import * as NotificationService from '../actions/notification.actions';

export function MarkAllReadButton() {
  const [isPending, setIsPending] = useState(false);

  const handleMarkAllRead = async () => {
    setIsPending(true);
    await NotificationService.markAllRead();
    setIsPending(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleMarkAllRead}
      disabled={isPending}
      className="text-slate-600 hover:text-slate-900"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <CheckCheck className="w-4 h-4 mr-2" />
      )}
      Mark all read
    </Button>
  );
}
