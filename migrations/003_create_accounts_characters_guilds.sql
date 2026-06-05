-- Migration: Create accounts, characters, and guilds tables
-- Run after 002_create_content_hierarchy.sql
-- Run against PostgreSQL
--
-- Soft-delete pattern: all tables have is_deleted column (default false).
-- Instead of CASCADE/SET NULL on delete, records are flagged is_deleted = true.

-- ============================================================
-- ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_is_deleted ON accounts(is_deleted);

-- ============================================================
-- GUILDS
-- ============================================================
CREATE TABLE IF NOT EXISTS guilds (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    realm       VARCHAR(50) NOT NULL,
    faction     VARCHAR(50) NOT NULL,
    guild_type  VARCHAR(20) NOT NULL DEFAULT 'guild',
    is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guilds_name_realm ON guilds(name, realm);
CREATE INDEX IF NOT EXISTS idx_guilds_is_deleted ON guilds(is_deleted);

-- ============================================================
-- CHARACTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS characters (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    realm       VARCHAR(50) NOT NULL,
    faction     VARCHAR(50) NOT NULL,
    player_class VARCHAR(50),
    spec        VARCHAR(50),
    item_level  INTEGER,
    account_id  UUID NOT NULL REFERENCES accounts(id),
    guild_id    UUID REFERENCES guilds(id),
    is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_characters_account_id ON characters(account_id);
CREATE INDEX IF NOT EXISTS idx_characters_guild_id ON characters(guild_id);
CREATE INDEX IF NOT EXISTS idx_characters_name_realm ON characters(name, realm);
CREATE INDEX IF NOT EXISTS idx_characters_is_deleted ON characters(is_deleted);
