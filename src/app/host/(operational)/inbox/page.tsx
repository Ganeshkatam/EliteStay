import { MessageSquare } from 'lucide-react';

export default function HostInboxEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6">
        <MessageSquare className="w-8 h-8 text-slate-300 stroke-[2]" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Host Inbox</h3>
      <p className="text-slate-500 max-w-sm text-sm">
        Select a conversation from the list to view your messages with guests.
      </p>
    </div>
  );
}
