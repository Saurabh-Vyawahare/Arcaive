-- ═══════════════════════════════════════════════════════════
-- Arcaive — Documents Table
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    pages INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'processing',  -- processing | indexed | failed
    tree_json JSONB,                          -- the PageIndex tree structure
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user ON documents (user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents (status);
