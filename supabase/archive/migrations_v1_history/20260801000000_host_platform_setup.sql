-- Add 'ready' to listing_status ENUM
ALTER TYPE public.listing_status ADD VALUE IF NOT EXISTS 'ready' AFTER 'draft';

-- Create listing_build_progress table
CREATE TABLE IF NOT EXISTS public.listing_build_progress (
    listing_id UUID PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
    step_completed TEXT,
    last_step TEXT NOT NULL DEFAULT 'accommodation',
    percent_complete INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for listing_build_progress
ALTER TABLE public.listing_build_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view own listing progress"
    ON public.listing_build_progress
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l 
            WHERE l.id = listing_build_progress.listing_id 
            AND l.host_id = auth.uid()
        )
    );

CREATE POLICY "Hosts can insert own listing progress"
    ON public.listing_build_progress
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.listings l 
            WHERE l.id = listing_build_progress.listing_id 
            AND l.host_id = auth.uid()
        )
    );

CREATE POLICY "Hosts can update own listing progress"
    ON public.listing_build_progress
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l 
            WHERE l.id = listing_build_progress.listing_id 
            AND l.host_id = auth.uid()
        )
    );

CREATE POLICY "Hosts can delete own listing progress"
    ON public.listing_build_progress
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l 
            WHERE l.id = listing_build_progress.listing_id 
            AND l.host_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.listing_build_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
