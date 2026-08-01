'use client';

import { type ConversationParticipant } from '../actions/conversation-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home } from 'lucide-react';

interface ConversationHeaderProps {
  participant: ConversationParticipant;
  listing: {
    id: string;
    title: string;
  };
  context: {
    type: 'booking' | 'stay' | 'inquiry';
    status?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function ConversationHeader({ participant, listing, context }: ConversationHeaderProps) {
  const initials = participant.name.substring(0, 2).toUpperCase();

  let avatarUrl = participant.avatar_url;
  if (avatarUrl && !avatarUrl.startsWith('http')) {
    avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`;
  }

  const renderContext = () => {
    if (context.type === 'stay') {
      return (
        <span className="truncate ml-2 pl-2 border-l border-slate-300">
          <span className="font-semibold text-slate-700">Current Stay: </span>
          {context.startDate ? new Date(context.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} 
          {context.endDate ? ` – ${new Date(context.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
        </span>
      );
    }
    
    if (context.type === 'booking') {
      const statusText = context.status === 'pending' ? 'Pending Approval' : 
                         context.status === 'approved' ? 'Approved' :
                         context.status === 'rejected' ? 'Declined' :
                         context.status === 'cancelled' ? 'Cancelled' : context.status;
                         
      return (
        <span className="truncate ml-2 pl-2 border-l border-slate-300">
          <span className="font-semibold text-slate-700">Booking: </span>
          {statusText}
          {context.startDate && (
            <>
              <span className="mx-2">•</span>
              <span className="font-semibold text-slate-700">Move-in: </span>
              {new Date(context.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </>
          )}
        </span>
      );
    }
    
    return (
      <span className="truncate ml-2 pl-2 border-l border-slate-300">
        <span className="font-semibold text-slate-700">Inquiry: </span>
        No booking created yet.
      </span>
    );
  };

  return (
    <div className="h-20 shrink-0 border-b border-slate-200 bg-white flex items-center px-6 gap-4">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={avatarUrl || undefined} alt={participant.name} />
        <AvatarFallback className="bg-slate-900 text-white text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="text-sm font-bold text-slate-900 truncate">
          {participant.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
          <Home className="w-3.5 h-3.5" />
          <span className="font-medium truncate">{listing.title}</span>
          {renderContext()}
        </div>
      </div>
    </div>
  );
}
