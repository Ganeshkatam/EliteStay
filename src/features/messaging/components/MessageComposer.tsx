'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessage } from '../actions/message-actions';
import { useRouter } from 'next/navigation';

interface MessageComposerProps {
  conversationId: string;
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    if (!content.trim() || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(conversationId, content);
      setContent('');
      // Refresh the page data to show the new message
      router.refresh();
    } catch (err) {
      console.error('Failed to send message:', err);
      // In a real app we'd use a toast here
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Placeholder for future left-side actions (e.g., attachments, images) */}
        <div className="flex items-center pb-2 px-1 hidden">
           {/* Future: <Button variant="ghost" size="icon">...</Button> */}
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[48px] max-h-[120px] resize-none py-3 px-4 shadow-sm border-slate-200 focus-visible:ring-slate-900 rounded-2xl flex-1"
          disabled={isSending}
        />

        {/* Placeholder for future right-side actions inside input (e.g., emoji) */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSend} 
            disabled={!content.trim() || isSending}
            size="icon"
            className="h-12 w-12 rounded-full shrink-0 shadow-sm"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
