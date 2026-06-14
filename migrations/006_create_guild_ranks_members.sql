-- Migration: Create guild_ranks, guild_members, and add loot_config to guilds
-- Run after 005_add_normalized_name_to_items.sql
-- Run against PostgreSQL

-- ============================================================
-- GUILD RANKS
-- Each guild defines its own rank hierarchy.
-- priority = 0-100, higher = better loot priority.
-- default_loyalty = 0-100, can be overridden per member.
-- ============================================================
CREATE TABLE IF NOT EXISTS guild_ranks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    priority        INTEGER NOT NULL DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
    default_loyalty INTEGER NOT NULL DEFAULT 50 CHECK (default_loyalty >= 0 AND default_loyalty <= 100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guild_ranks_guild_id ON guild_ranks(guild_id);

-- ============================================================
-- GUILD MEMBERS
-- Each character in a guild gets a membership record.
-- Unique constraint prevents duplicate membership.
-- is_on_raid_roster determines whether character is eligible for loot.
-- ============================================================
CREATE TABLE IF NOT EXISTS guild_members (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id            UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    character_id        UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    rank_id             UUID NOT NULL REFERENCES guild_ranks(id) ON DELETE RESTRICT,
    loyalty_override    INTEGER CHECK (loyalty_override >= 0 AND loyalty_override <= 100),
    is_on_raid_roster   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guild_members_guild_char ON guild_members(guild_id, character_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_rank_id ON guild_members(rank_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_roster ON guild_members(guild_id, is_on_raid_roster);

-- ============================================================
-- LOOT CONFIG (JSONB on guilds)
-- Stores per-guild section weights for the recommendation engine.
-- ============================================================
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS loot_config JSONB;
