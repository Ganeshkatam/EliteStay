'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface RealtimeSubscriberProps {
  conversationId?: string; // Optional: if provided, only refresh for this conversation. If not, refresh for any.
  currentUserId: string;
}

export function RealtimeSubscriber({ conversationId, currentUserId }: RealtimeSubscriberProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to all INSERTS on the messages table
    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as any;
          
          // Don't refresh if we sent it ourselves (we already call router.refresh() in the composer)
          if (newMsg.sender_id === currentUserId) return;
          
          // If we are on a specific conversation page, and the message belongs to it, refresh.
          // Or if we are just on the inbox page (no conversationId), refresh the list.
          if (!conversationId || newMsg.conversation_id === conversationId) {
            router.refresh();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          const updatedConv = payload.new as any;
          if (!conversationId || updatedConv.id === conversationId) {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, router]);

  return null;
}
