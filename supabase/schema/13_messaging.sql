/*
==================================================
Domain: Messaging
Purpose: V1 host-guest communication.
Contains: 
- conversations
- messages
- RLS
==================================================
*/

CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    stay_id UUID REFERENCES public.stays(id) ON DELETE SET NULL,
    guest_last_read_at TIMESTAMPTZ,
    host_last_read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    closed_at TIMESTAMPTZ,
    
    CONSTRAINT one_reference_only CHECK (
        (booking_id IS NOT NULL AND stay_id IS NULL) OR 
        (booking_id IS NULL AND stay_id IS NOT NULL)
    )
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations RLS
-- A user can view a conversation if they are the guest or host associated with the booking or stay
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    (booking_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.bookings b
        JOIN public.listings l ON l.id = b.listing_id
        WHERE b.id = conversations.booking_id
        AND (b.guest_id = auth.uid() OR l.host_id = auth.uid())
    ))
    OR
    (stay_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.stays s
        JOIN public.listings l ON l.id = s.listing_id
        WHERE s.id = conversations.stay_id
        AND (s.guest_id = auth.uid() OR l.host_id = auth.uid())
    ))
    OR public.is_admin()
  );

CREATE POLICY "System can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (true); -- Typically created via Server Action

CREATE POLICY "Users can update their own read state" ON public.conversations
  FOR UPDATE USING (
    (booking_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.bookings b
        JOIN public.listings l ON l.id = b.listing_id
        WHERE b.id = conversations.booking_id
        AND (b.guest_id = auth.uid() OR l.host_id = auth.uid())
    ))
    OR
    (stay_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.stays s
        JOIN public.listings l ON l.id = s.listing_id
        WHERE s.id = conversations.stay_id
        AND (s.guest_id = auth.uid() OR l.host_id = auth.uid())
    ))
  );

-- Messages RLS
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
        AND (
            (c.booking_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.bookings b
                JOIN public.listings l ON l.id = b.listing_id
                WHERE b.id = c.booking_id
                AND (b.guest_id = auth.uid() OR l.host_id = auth.uid())
            ))
            OR
            (c.stay_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.stays s
                JOIN public.listings l ON l.id = s.listing_id
                WHERE s.id = c.stay_id
                AND (s.guest_id = auth.uid() OR l.host_id = auth.uid())
            ))
        )
    )
    OR public.is_admin()
  );

CREATE POLICY "Users can send messages to their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
        AND (
            (c.booking_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.bookings b
                JOIN public.listings l ON l.id = b.listing_id
                WHERE b.id = c.booking_id
                AND (b.guest_id = auth.uid() OR l.host_id = auth.uid())
            ))
            OR
            (c.stay_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.stays s
                JOIN public.listings l ON l.id = s.listing_id
                WHERE s.id = c.stay_id
                AND (s.guest_id = auth.uid() OR l.host_id = auth.uid())
            ))
        )
    )
  );
