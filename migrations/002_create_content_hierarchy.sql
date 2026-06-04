-- Migration: Create content hierarchy tables (Season, Raid, Boss, Difficulty, Item)
-- Run after 001_create_expansions_patches.sql
-- Run against PostgreSQL

CREATE TABLE IF NOT EXISTS seasons (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    expansion_id UUID REFERENCES expansions(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE patches ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_patches_season_id ON patches(season_id);

CREATE TABLE IF NOT EXISTS raids (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    expansion_id UUID NOT NULL REFERENCES expansions(id) ON DELETE CASCADE,
    "order"     INTEGER,
    available_from DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raids_expansion_id ON raids(expansion_id);

CREATE TABLE IF NOT EXISTS raid_patches (
    raid_id UUID NOT NULL REFERENCES raids(id) ON DELETE CASCADE,
    patch_id UUID NOT NULL REFERENCES patches(id) ON DELETE CASCADE,
    PRIMARY KEY (raid_id, patch_id)
);

CREATE INDEX IF NOT EXISTS idx_raid_patches_raid_id ON raid_patches(raid_id);
CREATE INDEX IF NOT EXISTS idx_raid_patches_patch_id ON raid_patches(patch_id);

CREATE TABLE IF NOT EXISTS bosses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    raid_id     UUID NOT NULL REFERENCES raids(id) ON DELETE CASCADE,
    "order"     INTEGER,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bosses_raid_id ON bosses(raid_id);

DO $$ BEGIN
    CREATE TYPE difficulty_name AS ENUM ('LFR', 'Normal', 'Heroic', 'Mythic');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS difficulties (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boss_id     UUID NOT NULL REFERENCES bosses(id) ON DELETE CASCADE,
    difficulty  difficulty_name NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_difficulties_boss_id ON difficulties(boss_id);

CREATE TABLE IF NOT EXISTS items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    difficulty_id UUID NOT NULL REFERENCES difficulties(id) ON DELETE CASCADE,
    ilvl        INTEGER,
    slot        VARCHAR(100),
    class       VARCHAR(100),
    subclass    VARCHAR(100),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_difficulty_id ON items(difficulty_id);
