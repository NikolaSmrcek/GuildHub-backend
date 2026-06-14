 -- Migration: Create expansions and patches tables
-- Run against PostgreSQL

CREATE TABLE IF NOT EXISTS expansions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    short_name  VARCHAR(50),
    release_date DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patches (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expansion_id UUID NOT NULL REFERENCES expansions(id) ON DELETE CASCADE,
    patch_number VARCHAR(20) NOT NULL,
    name        VARCHAR(255),
    release_date DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patches_expansion_id ON patches(expansion_id);
CREATE INDEX IF NOT EXISTS idx_patches_patch_number ON patches(patch_number);
