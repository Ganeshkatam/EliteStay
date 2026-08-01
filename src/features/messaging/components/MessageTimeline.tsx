'use client';

import { useEffect, useRef, Fragment } from 'react';
import { type MessageRow } from '../actions/message-actions';
import { MessageBubble } from './MessageBubble';
import { isSameDay, isToday, isYesterday, format, differenceInMinutes } from 'date-fns';

interface MessageTimelineProps {
  messages: MessageRow[];
  currentUserId: string;
}

export function MessageTimeline({ messages, currentUserId }: MessageTimelineProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 relative">
      {messages.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
          <p className="text-sm font-medium">No messages yet.</p>
          <p className="text-xs mt-1">Send a message to start the conversation.</p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const currentMsgDate = new Date(msg.created_at);
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

          let showDateSeparator = false;
          if (!prevMsg || !isSameDay(currentMsgDate, new Date(prevMsg.created_at))) {
            showDateSeparator = true;
          }

          let dateLabel = '';
          if (showDateSeparator) {
            if (isToday(currentMsgDate)) dateLabel = 'Today';
            else if (isYesterday(currentMsgDate)) dateLabel = 'Yesterday';
            else dateLabel = format(currentMsgDate, 'MMM d, yyyy');
          }

          const isSameSenderAsNext = Boolean(nextMsg && nextMsg.sender_id === msg.sender_id);
          const isSameSenderAsPrev = Boolean(prevMsg && prevMsg.sender_id === msg.sender_id);
          const isConsecutiveWithPrev = isSameSenderAsPrev && !showDateSeparator;

          // Show timestamp only if the next message is from a different sender, 
          // or if the next message is significantly later (e.g. > 10 mins),
          // or if this is the last message in the list.
          let showTimestamp = true;
          if (isSameSenderAsNext && nextMsg) {
            const minsDiff = differenceInMinutes(new Date(nextMsg.created_at), currentMsgDate);
            if (minsDiff < 10) {
              showTimestamp = false;
            }
          }

          return (
            <Fragment key={msg.id}>
              {showDateSeparator && (
                <div className="flex justify-center my-6">
                  <span className="text-[11px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">
                    {dateLabel}
                  </span>
                </div>
              )}
              <MessageBubble
                content={msg.content}
                createdAt={msg.created_at}
                isOwn={msg.sender_id === currentUserId}
                showTimestamp={showTimestamp}
                isConsecutive={isConsecutiveWithPrev}
              />
            </Fragment>
          );
        })
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
}
