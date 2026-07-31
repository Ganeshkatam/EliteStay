import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { MessageThread } from '@/features/messaging/components/MessageThread';

export default async function MessageThreadPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select(`
      id,
      bookings ( guest_id, listings ( host_id, title ) ),
      stays ( guest_id, listings ( host_id, title ) ),
      messages ( * )
    `)
    .eq('id', params.id)
    .single();

  if (convError || !conversation) {
    notFound();
  }

  // Ensure authorized (this is technically checked by RLS, but if RLS returns nothing it throws 404 above)
  const messages = conversation.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const firstBooking = Array.isArray(conversation.bookings) ? conversation.bookings[0] : conversation.bookings;
  const firstStay = Array.isArray(conversation.stays) ? conversation.stays[0] : conversation.stays;
  const title = (firstBooking?.listings as any)?.title || (firstStay?.listings as any)?.title || 'Conversation';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages: {title}</h1>
      </div>
      
      <MessageThread 
        conversationId={conversation.id} 
        initialMessages={messages} 
        currentUserId={user.id} 
      />
    </div>
  );
}
