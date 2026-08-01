'use client';

import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../actions/message-actions';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { format } from 'date-fns';

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export function MessageThread({ 
  conversationId, 
  initialMessages,
  currentUserId
}: { 
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setIsSending(true);
    const content = input;
    setInput('');
    
    // Optimistic
    const tempId = Math.random().toString();
    setMessages(prev => [...prev, { id: tempId, sender_id: currentUserId, content, created_at: new Date().toISOString() }]);

    try {
      await sendMessage(conversationId, content);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
    
    setIsSending(false);
  };

  return (
    <div className="flex flex-col h-[600px] border border-gray-200 rounded-xl bg-white overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            No messages yet. Send a message to start the conversation.
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-br-sm' 
                      : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] mt-1 block ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 h-[50px] min-h-[50px]"
        />
        <Button 
          onClick={handleSend} 
          disabled={!input.trim() || isSending}
          className="h-[50px] w-[50px] rounded-lg p-0 flex items-center justify-center shrink-0"
        >
          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
