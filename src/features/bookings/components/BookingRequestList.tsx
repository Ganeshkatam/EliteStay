'use client';

import { useState } from 'react';
import { approveBooking, rejectBooking } from '../actions/bookingActions';
import { getOrCreateConversation } from '@/features/messaging/actions/conversation-actions';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Booking = any; // In a real app, infer this from Supabase types

export function BookingRequestList({
  initialBookings,
}: {
  initialBookings: Booking[];
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);

  const handleMessage = async (bookingId: string) => {
    setMessagingId(bookingId);
    const res = await getOrCreateConversation({ bookingId });
    if (res.conversationId) {
      router.push(`/users/inbox/${res.conversationId}`);
    } else {
      alert(res.error || 'Failed to open messages');
      setMessagingId(null);
    }
  };

  const handleResponse = async (
    bookingId: string,
    action: 'approve' | 'reject'
  ) => {
    setLoadingId(bookingId);

    const res =
      action === 'approve'
        ? await approveBooking(bookingId)
        : await rejectBooking(bookingId);

    setLoadingId(null);

    if (res.error) {
      alert(res.error);
    } else {
      // Optimistically update the list
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: action === 'approve' ? 'approved' : 'rejected' }
            : b
        )
      );
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center rounded-xl border border-dashed border-gray-300 p-12">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          No bookings
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You don&apos;t have any booking requests yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="overflow-hidden rounded-xl bg-white shadow border border-gray-200"
        >
          <div className="p-6 sm:flex sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative h-12 w-12 flex-shrink-0 rounded-full bg-gray-200 overflow-hidden">
                {booking.guest?.avatar_storage_path ? (
                  <Image
                    src={booking.guest.avatar_storage_path}
                    alt={booking.guest.full_name || 'Guest'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-800 text-white font-medium">
                    {booking.guest?.full_name?.charAt(0) || 'G'}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">
                  {booking.guest?.full_name || 'Anonymous Guest'}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Requested to book{' '}
                  <span className="font-medium text-gray-900">
                    {booking.listings?.title}
                  </span>
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                      />
                    </svg>
                    Move in:{' '}
                    {format(new Date(booking.requested_move_in), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Duration: {booking.requested_duration} period(s)
                  </div>
                </div>
                {booking.message && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 italic border border-gray-100">
                    &quot;{booking.message}&quot;
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-3 sm:mt-0 sm:flex-col sm:items-end">
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  booking.status === 'pending'
                    ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                    : booking.status === 'approved'
                      ? 'bg-green-50 text-green-700 ring-green-600/20'
                      : 'bg-red-50 text-red-700 ring-red-600/10'
                }`}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </span>

              {booking.status === 'pending' && (
                <div className="mt-4 flex flex-col gap-2 w-full sm:w-auto">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleResponse(booking.id, 'reject')}
                      disabled={loadingId === booking.id}
                      className="w-1/2"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleResponse(booking.id, 'approve')}
                      disabled={loadingId === booking.id}
                      className="w-1/2"
                    >
                      {loadingId === booking.id && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Approve
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleMessage(booking.id)}
                    disabled={messagingId === booking.id}
                    className="w-full text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                  >
                    {messagingId === booking.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquare className="mr-2 h-4 w-4" />
                    )}
                    Message Guest
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
