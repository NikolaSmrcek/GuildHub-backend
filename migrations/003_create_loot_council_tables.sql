-- Migration: Create loot council / distribution tables
-- Run after 002_create_content_hierarchy.sql
-- Run against PostgreSQL

DO $$ BEGIN
    CREATE TYPE vote_value AS ENUM ('yes', 'no', 'abstain');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE request_priority AS ENUM ('offspec', 'main');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('open', 'resolved', 'withdrawn');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE member_role AS ENUM ('member', 'officer', 'council', 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- Members (guild members)
-- ============================================================
CREATE TABLE IF NOT EXISTS members (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(255) NOT NULL,
    roles        member_role[] NOT NULL DEFAULT '{member}',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Guilds
-- ============================================================
CREATE TABLE IF NOT EXISTS guilds (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(255) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Guild members (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS guild_members (
    guild_id   UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    member_id  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    PRIMARY KEY (guild_id, member_id)
);

-- ============================================================
-- Raid events (a specific occurrence of a guild running a raid)
-- ============================================================
CREATE TABLE IF NOT EXISTS raid_events (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id     UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    raid_id      UUID REFERENCES raids(id) ON DELETE SET NULL,
    "timestamp"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    zone         VARCHAR(255),
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raid_events_guild_id ON raid_events(guild_id);
CREATE INDEX IF NOT EXISTS idx_raid_events_raid_id ON raid_events(raid_id);
CREATE INDEX IF NOT EXISTS idx_raid_events_timestamp ON raid_events("timestamp");

-- ============================================================
-- Raid event attendees (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS raid_event_attendees (
    raid_event_id UUID NOT NULL REFERENCES raid_events(id) ON DELETE CASCADE,
    member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    PRIMARY KEY (raid_event_id, member_id)
);

-- ============================================================
-- Loot requests
-- ============================================================
CREATE TABLE IF NOT EXISTS loot_requests (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raid_event_id  UUID NOT NULL REFERENCES raid_events(id) ON DELETE CASCADE,
    item_id        UUID REFERENCES items(id) ON DELETE SET NULL,
    requester_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    priority       request_priority NOT NULL DEFAULT 'main',
    reason         TEXT,
    status         request_status NOT NULL DEFAULT 'open',
    "timestamp"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loot_requests_raid_event_id ON loot_requests(raid_event_id);
CREATE INDEX IF NOT EXISTS idx_loot_requests_requester_id ON loot_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_loot_requests_item_id ON loot_requests(item_id);
CREATE INDEX IF NOT EXISTS idx_loot_requests_status ON loot_requests(status);

-- ============================================================
-- Loot councils (decision sessions)
-- ============================================================
CREATE TABLE IF NOT EXISTS loot_councils (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raid_event_id  UUID NOT NULL REFERENCES raid_events(id) ON DELETE CASCADE,
    opened_by      UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    title          VARCHAR(255),
    is_open        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loot_councils_raid_event_id ON loot_councils(raid_event_id);

-- ============================================================
-- Loot council items (items up for decision in a council)
-- ============================================================
CREATE TABLE IF NOT EXISTS loot_council_items (
    council_id UUID NOT NULL REFERENCES loot_councils(id) ON DELETE CASCADE,
    item_id    UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    PRIMARY KEY (council_id, item_id)
);

-- ============================================================
-- Council votes
-- ============================================================
CREATE TABLE IF NOT EXISTS council_votes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    council_id  UUID NOT NULL REFERENCES loot_councils(id) ON DELETE CASCADE,
    voter_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    vote        vote_value NOT NULL,
    weight      NUMERIC NOT NULL DEFAULT 1,
    comment     TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One vote per voter per council (idempotent)
    UNIQUE (council_id, voter_id)
);

CREATE INDEX IF NOT EXISTS idx_council_votes_council_id ON council_votes(council_id);
CREATE INDEX IF NOT EXISTS idx_council_votes_voter_id ON council_votes(voter_id);

-- ============================================================
-- Distribution records (finalized item assignments)
-- ============================================================
CREATE TABLE IF NOT EXISTS distribution_records (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raid_event_id UUID REFERENCES raid_events(id) ON DELETE SET NULL,
    item_id       UUID REFERENCES items(id) ON DELETE SET NULL,
    recipient_id  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    finalized_by  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    rationale     TEXT,
    "timestamp"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Each item can only be distributed once per raid event
    UNIQUE (raid_event_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_distribution_records_raid_event_id ON distribution_records(raid_event_id);
CREATE INDEX IF NOT EXISTS idx_distribution_records_recipient_id ON distribution_records(recipient_id);
CREATE INDEX IF NOT EXISTS idx_distribution_records_item_id ON distribution_records(item_id);

-- ============================================================
-- Audit log (append-only log for distribution decisions)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action        VARCHAR(100) NOT NULL,
    entity_type   VARCHAR(100) NOT NULL,
    entity_id     UUID,
    payload       JSONB,
    performed_by  UUID REFERENCES members(id) ON DELETE SET NULL,
    "timestamp"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs("timestamp");
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
