-- Migration: Create raidbots_reports and raidbots_report_items tables
-- Run after 003_create_accounts_characters_guilds.sql
-- Run against PostgreSQL

-- ============================================================
-- RAIDBOTS REPORTS
-- Each report belongs to exactly one character.
-- The report is created when a valid Raidbots URL is submitted.
-- ============================================================
CREATE TABLE IF NOT EXISTS raidbots_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_url      VARCHAR(512) NOT NULL,
    character_id    UUID NOT NULL REFERENCES characters(id),
    player_name     VARCHAR(255) NOT NULL,
    player_class    VARCHAR(50),
    player_spec     VARCHAR(50),
    player_dps_mean DOUBLE PRECISION NOT NULL DEFAULT 0,
    is_valid        BOOLEAN NOT NULL DEFAULT TRUE,
    raw_data        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raidbots_reports_character_id ON raidbots_reports(character_id);
CREATE INDEX IF NOT EXISTS idx_raidbots_reports_report_url ON raidbots_reports(report_url);

-- ============================================================
-- RAIDBOTS REPORT ITEMS (upgrades identified from the report)
-- Each row links an upgrade from the report to an existing item.
-- One-to-one: each report item links to one item, each item links to one report item.
-- ============================================================
CREATE TABLE IF NOT EXISTS raidbots_report_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id           UUID NOT NULL REFERENCES raidbots_reports(id) ON DELETE CASCADE,
    item_id             UUID NOT NULL REFERENCES items(id),
    item_name           VARCHAR(255) NOT NULL,
    player_dps_mean     DOUBLE PRECISION NOT NULL DEFAULT 0,
    upgrade_dps_mean    DOUBLE PRECISION NOT NULL DEFAULT 0,
    dps_improvement     DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raidbots_report_items_report_id ON raidbots_report_items(report_id);
CREATE INDEX IF NOT EXISTS idx_raidbots_report_items_item_id ON raidbots_report_items(item_id);
