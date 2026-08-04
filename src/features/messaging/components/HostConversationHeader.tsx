'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home } from 'lucide-react';
import { HostInboxViewModel } from '../view-models/inbox.viewmodel';
import { Badge } from '@/components/ui/badge';

interface HostConversationHeaderProps {
  conversation: HostInboxViewModel;
}

export function HostConversationHeader({
  conversation,
}: HostConversationHeaderProps) {
  const guestName = conversation.guest.fullName;
  const initials = guestName.substring(0, 2).toUpperCase();

  let avatarUrl = conversation.guest.avatarUrl;
  if (avatarUrl && !avatarUrl.startsWith('http')) {
    avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`;
  }

  const renderContext = () => {
    if (conversation.type === 'STAY') {
      return (
        <span className="truncate ml-2 pl-2 border-l border-slate-300">
          <Badge variant="outline" className="text-[10px] h-5">
            Active Stay
          </Badge>
        </span>
      );
    }

    if (conversation.type === 'BOOKING') {
      return (
        <span className="truncate ml-2 pl-2 border-l border-slate-300 flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] h-5">
            Booking
          </Badge>
          {conversation.context.reservationStatus && (
            <span className="text-xs font-semibold text-slate-700 capitalize">
              {conversation.context.reservationStatus}
            </span>
          )}
        </span>
      );
    }

    return (
      <span className="truncate ml-2 pl-2 border-l border-slate-300">
        <Badge variant="secondary" className="text-[10px] h-5">
          Inquiry
        </Badge>
      </span>
    );
  };

  return (
    <div className="h-20 shrink-0 border-b border-slate-200 bg-white flex items-center px-6 gap-4">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={avatarUrl || undefined} alt={guestName} />
        <AvatarFallback className="bg-slate-900 text-white text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="text-sm font-bold text-slate-900 truncate">
          {guestName}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
          <Home className="w-3.5 h-3.5" />
          <span className="font-medium truncate">
            {conversation.listing?.title || 'General Inquiry'}
          </span>
          {renderContext()}
        </div>
      </div>
    </div>
  );
}
