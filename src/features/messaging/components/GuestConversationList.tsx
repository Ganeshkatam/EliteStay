'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GuestInboxViewModel } from '../view-models/inbox.viewmodel';
import { formatDistanceToNowStrict } from 'date-fns';
import { Search } from 'lucide-react';

interface GuestConversationListProps {
  initialConversations: GuestInboxViewModel[];
}

export function GuestConversationList({
  initialConversations,
}: GuestConversationListProps) {
  const params = useParams();
  const activeConversationId = params?.conversationId as string | undefined;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return initialConversations;

    const query = searchQuery.toLowerCase();
    return initialConversations.filter((conv) => {
      const matchName = conv.host.fullName.toLowerCase().includes(query);
      const matchListing = conv.listing?.title.toLowerCase().includes(query);
      const matchMessage = conv.latestMessage?.content
        ?.toLowerCase()
        .includes(query);
      return matchName || matchListing || matchMessage;
    });
  }, [initialConversations, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 border-b border-slate-200 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Inbox</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
          />
        </div>
      </div>
      <div className="flex flex-col flex-1">
        {initialConversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <p className="text-sm">No conversations yet.</p>
            <p className="text-xs mt-2">
              Once you contact a host or receive a booking enquiry, your
              conversations will appear here.
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No conversations match your search.
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = activeConversationId === conv.id;
            const displayUnreadCount = isActive ? 0 : conv.unreadCount;
            const initials = conv.host.fullName.substring(0, 2).toUpperCase();

            let avatarUrl = conv.host.avatarUrl;
            if (avatarUrl && !avatarUrl.startsWith('http')) {
              avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`;
            }

            const timeString = conv.latestMessage
              ? formatDistanceToNowStrict(
                  new Date(conv.latestMessage.createdAt),
                  { addSuffix: false }
                )
              : formatDistanceToNowStrict(new Date(conv.updatedAt), {
                  addSuffix: false,
                });

            return (
              <Link
                key={conv.id}
                href={`/users/inbox/${conv.id}`}
                className={cn(
                  'flex items-start gap-3 p-4 border-b border-slate-100 transition-colors hover:bg-slate-50',
                  isActive ? 'bg-slate-50' : ''
                )}
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage
                    src={avatarUrl || undefined}
                    alt={conv.host.fullName}
                  />
                  <AvatarFallback className="bg-slate-900 text-white text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 truncate">
                      {conv.host.businessName || conv.host.fullName}
                    </span>
                    <span className="text-xs text-slate-500 shrink-0">
                      {timeString}
                    </span>
                  </div>

                  <span className="text-xs font-medium text-slate-500 truncate mb-1">
                    {conv.listing?.title || 'General Inquiry'}
                  </span>

                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        'text-sm truncate',
                        displayUnreadCount > 0
                          ? 'text-slate-900 font-medium'
                          : 'text-slate-500'
                      )}
                    >
                      {conv.latestMessage
                        ? conv.latestMessage.content
                        : 'No messages yet'}
                    </p>

                    {displayUnreadCount > 0 && (
                      <span className="shrink-0 flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                        {displayUnreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
