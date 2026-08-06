CREATE TYPE resident_notice_type AS ENUM ('RENT_REMINDER', 'MAINTENANCE', 'INSPECTION', 'RENEWAL');

CREATE TABLE resident_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lease_id UUID REFERENCES leases(id) ON DELETE CASCADE,
    type resident_notice_type NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resident_notices_resident ON resident_notices(resident_id);
CREATE INDEX idx_resident_notices_lease ON resident_notices(lease_id);

ALTER TABLE resident_notices ENABLE ROW LEVEL SECURITY;
