CREATE TYPE document_type AS ENUM ('LEASE', 'ID', 'INVOICE', 'MOVE_IN_REPORT', 'MAINTENANCE_PHOTO');

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_type TEXT NOT NULL,
    owner_id UUID NOT NULL,
    type document_type NOT NULL,
    storage_path TEXT NOT NULL,
    bucket TEXT NOT NULL,
    checksum TEXT,
    mime_type TEXT,
    size_bytes BIGINT,
    version INTEGER DEFAULT 1,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_owner ON documents(owner_type, owner_id);
CREATE INDEX idx_documents_storage ON documents(bucket, storage_path);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
