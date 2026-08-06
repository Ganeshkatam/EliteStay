CREATE TABLE resident_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    vehicle_registration JSONB DEFAULT '[]'::jsonb,
    employment_status TEXT,
    preferred_communication TEXT DEFAULT 'EMAIL',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE resident_profiles ENABLE ROW LEVEL SECURITY;
