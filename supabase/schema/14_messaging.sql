/*
==================================================
Domain: Messaging
Purpose: Real-time user communications linked to bookings and stays.
Contains: 
- conversations
- messages
- triggers, RLS, & foreign key indexes
==================================================
*/

CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    stay_id UUID REFERENCES public.stays(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_conversation_link CHECK (
        (booking_id IS NOT NULL AND stay_id IS NULL) OR 
        (booking_id IS NULL AND stay_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_conversations_booking_id ON public.conversations (booking_id);
CREATE INDEX IF NOT EXISTS idx_conversations_stay_id ON public.conversations (stay_id);

CREATE TRIGGER conversations_updated_at 
  BEFORE UPDATE ON public.conversations 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policies
CREATE POLICY "Users can access their booking conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = conversations.booking_id
      AND (b.guest_id = auth.uid() OR public.is_listing_owner(b.listing_id) OR public.is_admin())
    )
  );

CREATE POLICY "Users can access their stay conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stays s
      WHERE s.id = conversations.stay_id
      AND (s.guest_id = auth.uid() OR public.is_listing_owner(s.listing_id) OR public.is_admin())
    )
  );

CREATE POLICY "Users can insert conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = conversations.booking_id
      AND (b.guest_id = auth.uid() OR public.is_listing_owner(b.listing_id) OR public.is_admin())
    ) OR EXISTS (
      SELECT 1 FROM public.stays s
      WHERE s.id = conversations.stay_id
      AND (s.guest_id = auth.uid() OR public.is_listing_owner(s.listing_id) OR public.is_admin())
    )
  );

-- Messages Policies
CREATE POLICY "Users can read messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      LEFT JOIN public.bookings b ON b.id = c.booking_id
      LEFT JOIN public.stays s ON s.id = c.stay_id
      WHERE c.id = messages.conversation_id
      AND (
        b.guest_id = auth.uid() OR public.is_listing_owner(b.listing_id) OR
        s.guest_id = auth.uid() OR public.is_listing_owner(s.listing_id) OR
        public.is_admin()
      )
    )
  );

CREATE POLICY "Users can post messages to their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      LEFT JOIN public.bookings b ON b.id = c.booking_id
      LEFT JOIN public.stays s ON s.id = c.stay_id
      WHERE c.id = messages.conversation_id
      AND (
        b.guest_id = auth.uid() OR public.is_listing_owner(b.listing_id) OR
        s.guest_id = auth.uid() OR public.is_listing_owner(s.listing_id) OR
        public.is_admin()
      )
    )
  );
