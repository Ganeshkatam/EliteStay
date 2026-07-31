'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { checkInStay, checkOutStay, completeStay } from '../actions/stayActions';
import { getOrCreateConversation } from '@/features/messaging/actions/messageActions';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ReviewForm } from '@/features/reviews/components/ReviewForm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Stay = any; // Will use inferred types in a real app

export function StayList({ initialStays, viewType }: { initialStays: Stay[], viewType: 'host' | 'guest' }) {
  const router = useRouter();
  const [stays, setStays] = useState<Stay[]>(initialStays);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [reviewingStayId, setReviewingStayId] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);

  const handleMessage = async (stayId: string) => {
    setMessagingId(stayId);
    const res = await getOrCreateConversation({ stayId });
    if (res.data?.conversationId) {
      router.push(`/messages/${res.data.conversationId}`);
    } else {
      alert(res.error || 'Failed to open messages');
      setMessagingId(null);
    }
  };

  const handleAction = async (stayId: string, action: 'check_in' | 'check_out' | 'complete') => {
    setLoadingId(stayId);
    
    let res;
    if (action === 'check_in') res = await checkInStay(stayId);
    else if (action === 'check_out') res = await checkOutStay(stayId);
    else if (action === 'complete') res = await completeStay(stayId);
    
    setLoadingId(null);

    if (res?.error) {
      alert(res.error);
    } else if (res?.success) {
      router.refresh();
    }
  };

  if (stays.length === 0) {
    return (
      <div className="text-center rounded-xl border border-dashed border-gray-300 p-12">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No stays found</h3>
        <p className="mt-1 text-sm text-gray-500">You don&apos;t have any stays yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stays.map((stay) => {
        const otherUser = viewType === 'host' ? stay.guest : stay.listings?.host;
        const otherUserName = otherUser?.full_name || (viewType === 'host' ? 'Anonymous Guest' : 'Host');
        const otherUserAvatar = otherUser?.avatar_path;
        
        return (
          <div key={stay.id} className="overflow-hidden rounded-xl bg-white shadow border border-gray-200">
            <div className="p-6 sm:flex sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative h-12 w-12 flex-shrink-0 rounded-full bg-gray-200 overflow-hidden">
                  {otherUserAvatar ? (
                     <Image src={otherUserAvatar} alt={otherUserName} fill className="object-cover" />
                  ) : (
                     <div className="flex h-full w-full items-center justify-center bg-slate-800 text-white font-medium">
                       {otherUserName.charAt(0)}
                     </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{stay.listings?.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {viewType === 'host' ? `Guest: ${otherUserName}` : `Hosted by: ${otherUserName}`}
                  </p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-500">
                    <div>
                      <span className="block font-semibold text-gray-900">Move-in (Expected)</span>
                      {format(new Date(stay.expected_move_in_date), 'MMM d, yyyy')}
                    </div>
                    <div>
                      <span className="block font-semibold text-gray-900">Move-out (Expected)</span>
                      {format(new Date(stay.expected_move_out_date), 'MMM d, yyyy')}
                    </div>
                    {stay.actual_move_in_date && (
                      <div>
                        <span className="block font-semibold text-green-700">Move-in (Actual)</span>
                        {format(new Date(stay.actual_move_in_date), 'MMM d, yyyy')}
                      </div>
                    )}
                    {stay.actual_move_out_date && (
                      <div>
                        <span className="block font-semibold text-rose-700">Move-out (Actual)</span>
                        {format(new Date(stay.actual_move_out_date), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col gap-3 sm:mt-0 sm:items-end">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  stay.status === 'upcoming' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 
                  stay.status === 'active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                  stay.status === 'checked_out' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                  'bg-gray-50 text-gray-600 ring-gray-500/10'
                }`}>
                  {stay.status.toUpperCase().replace('_', ' ')}
                </span>

                <div className="mt-4 flex flex-col gap-2 w-full sm:w-auto">
                  {stay.status === 'upcoming' && (
                    <Button 
                      onClick={() => handleAction(stay.id, 'check_in')}
                      disabled={loadingId === stay.id}
                      className="w-full"
                    >
                      {loadingId === stay.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Check In
                    </Button>
                  )}
                  {stay.status === 'active' && (
                    <Button 
                      variant="outline"
                      onClick={() => handleAction(stay.id, 'check_out')}
                      disabled={loadingId === stay.id}
                      className="w-full"
                    >
                      {loadingId === stay.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Check Out
                    </Button>
                  )}
                  {viewType === 'host' && stay.status === 'checked_out' && (
                    <Button 
                      onClick={() => handleAction(stay.id, 'complete')}
                      disabled={loadingId === stay.id}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      {loadingId === stay.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Mark Completed
                    </Button>
                  )}
                  {viewType === 'guest' && stay.status === 'completed' && (!stay.reviews || stay.reviews.length === 0) && (
                    <Button 
                      variant="outline"
                      onClick={() => setReviewingStayId(stay.id === reviewingStayId ? null : stay.id)}
                      className="w-full"
                    >
                      {reviewingStayId === stay.id ? 'Cancel' : 'Leave a Review'}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => handleMessage(stay.id)}
                    disabled={messagingId === stay.id}
                    className="w-full text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                  >
                    {messagingId === stay.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                    Message {viewType === 'host' ? 'Guest' : 'Host'}
                  </Button>
                </div>
              </div>
            </div>
            
            {reviewingStayId === stay.id && (
              <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                <ReviewForm 
                  stayId={stay.id} 
                  listingId={stay.listing_id}
                  onSuccess={() => {
                    setReviewingStayId(null);
                    setStays(prev => prev.map(s => s.id === stay.id ? { ...s, reviews: [{ id: 'new' }] } : s));
                  }} 
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
