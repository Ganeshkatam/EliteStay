import { MessageSquare } from 'lucide-react';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inbox & Messages | EliteStay',
  description:
    'View and manage your conversations with hosts and guests on EliteStay.',
};

export default function InboxEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6">
        <MessageSquare className="w-8 h-8 text-slate-300 stroke-[2]" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Your Messages</h3>
      <p className="text-slate-500 max-w-sm text-sm">
        Select a conversation from the list to view your messages. Once you
        contact a host or receive a booking enquiry, they will appear here.
      </p>
    </div>
  );
}
