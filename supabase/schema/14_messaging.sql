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

CREATE TYPE public.conversation_type AS ENUM ('INQUIRY', 'BOOKING', 'STAY', 'SUPPORT', 'SYSTEM');
CREATE TYPE public.conversation_status AS ENUM ('OPEN', 'CLOSED', 'ARCHIVED', 'BLOCKED');

CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type public.conversation_type NOT NULL DEFAULT 'INQUIRY',
    status public.conversation_status NOT NULL DEFAULT 'OPEN',
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    stay_id UUID REFERENCES public.stays(id) ON DELETE SET NULL,
    guest_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    host_profile_id UUID REFERENCES public.host_profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_conversation_type CHECK (
        (type = 'INQUIRY' AND listing_id IS NOT NULL) OR
        (type = 'BOOKING' AND booking_id IS NOT NULL) OR
        (type = 'STAY' AND stay_id IS NOT NULL) OR
        (type IN ('SUPPORT', 'SYSTEM'))
    )
);

CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON public.conversations (listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_booking_id ON public.conversations (booking_id);
CREATE INDEX IF NOT EXISTS idx_conversations_stay_id ON public.conversations (stay_id);
CREATE INDEX IF NOT EXISTS idx_conversations_guest_id ON public.conversations (guest_id);
CREATE INDEX IF NOT EXISTS idx_conversations_host_profile_id ON public.conversations (host_profile_id);

CREATE TRIGGER conversations_updated_at 
  BEFORE UPDATE ON public.conversations 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policies
CREATE POLICY "Users can access their conversations" ON public.conversations
  FOR SELECT USING (
    guest_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.host_profiles hp 
      WHERE hp.id = conversations.host_profile_id AND hp.user_id = auth.uid()
    ) OR 
    public.is_admin()
  );

CREATE POLICY "Users can insert conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    guest_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.host_profiles hp 
      WHERE hp.id = conversations.host_profile_id AND hp.user_id = auth.uid()
    ) OR 
    public.is_admin()
  );

CREATE POLICY "Users can update conversations" ON public.conversations
  FOR UPDATE USING (
    guest_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.host_profiles hp 
      WHERE hp.id = conversations.host_profile_id AND hp.user_id = auth.uid()
    ) OR 
    public.is_admin()
  );

-- Messages Policies
CREATE POLICY "Users can read messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.guest_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.host_profiles hp 
          WHERE hp.id = c.host_profile_id AND hp.user_id = auth.uid()
        ) OR 
        public.is_admin()
      )
    )
  );

CREATE POLICY "Users can post messages to their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.guest_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.host_profiles hp 
          WHERE hp.id = c.host_profile_id AND hp.user_id = auth.uid()
        ) OR 
        public.is_admin()
      )
    )
  );

CREATE POLICY "Users can update messages in their conversations" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.guest_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.host_profiles hp 
          WHERE hp.id = c.host_profile_id AND hp.user_id = auth.uid()
        ) OR 
        public.is_admin()
      )
    )
  );
