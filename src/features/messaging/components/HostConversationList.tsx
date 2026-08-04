'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HostInboxViewModel } from '../view-models/inbox.viewmodel';
import { formatDistanceToNowStrict } from 'date-fns';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HostConversationListProps {
  initialConversations: HostInboxViewModel[];
}

export function HostConversationList({
  initialConversations,
}: HostConversationListProps) {
  const params = useParams();
  const activeConversationId = params?.conversationId as string | undefined;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return initialConversations;

    const query = searchQuery.toLowerCase();
    return initialConversations.filter((conv) => {
      const matchName = conv.guest.fullName.toLowerCase().includes(query);
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
              When guests contact you, their messages will appear here.
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
            const initials = conv.guest.fullName.substring(0, 2).toUpperCase();

            let avatarUrl = conv.guest.avatarUrl;
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
                href={`/host/inbox/${conv.id}`}
                className={cn(
                  'flex items-start gap-3 p-4 border-b border-slate-100 transition-colors hover:bg-slate-50',
                  isActive ? 'bg-slate-50' : ''
                )}
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage
                    src={avatarUrl || undefined}
                    alt={conv.guest.fullName}
                  />
                  <AvatarFallback className="bg-slate-900 text-white text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 truncate">
                      {conv.guest.fullName}
                    </span>
                    <span className="text-xs text-slate-500 shrink-0">
                      {timeString}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-500 truncate">
                      {conv.listing?.title || 'General Inquiry'}
                    </span>
                    {conv.type === 'BOOKING' && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4"
                      >
                        Booking
                      </Badge>
                    )}
                    {conv.type === 'INQUIRY' && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4"
                      >
                        Inquiry
                      </Badge>
                    )}
                  </div>

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
