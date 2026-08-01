/*
==================================================
Domain: Indexes
Purpose: Database performance optimizations using composite and partial indexes.
==================================================
*/

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_guest_status ON public.bookings (guest_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_listing_status ON public.bookings (listing_id, status);

-- Stays
CREATE INDEX IF NOT EXISTS idx_stays_guest_status ON public.stays (guest_id, status);
CREATE INDEX IF NOT EXISTS idx_stays_listing_status ON public.stays (listing_id, status);

-- Messaging
CREATE INDEX IF NOT EXISTS idx_conversations_booking_id ON public.conversations (booking_id);
CREATE INDEX IF NOT EXISTS idx_conversations_stay_id ON public.conversations (stay_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON public.reviews (listing_id);

-- Notifications (Partial Index for active/unread notifications)
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (user_id) WHERE read_at IS NULL;
-- General index for fetching all notifications sorted by time
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);

-- Availability (Composite for range queries)
CREATE INDEX IF NOT EXISTS idx_listing_availability_range ON public.listing_availability (listing_id, available_from);
