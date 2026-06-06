-- Migration: Add normalized_name column to items table
-- Run after 004_create_raidbots_reports.sql
-- Run against PostgreSQL

ALTER TABLE items ADD COLUMN IF NOT EXISTS normalized_name VARCHAR(255) NOT NULL DEFAULT '';

-- Populate normalized_name for existing rows (lowercase of name)
UPDATE items SET normalized_name = LOWER(name) WHERE normalized_name = '';

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_items_normalized_name ON items(normalized_name);

-- Make sure future inserts require normalized_name (remove default after backfill)
ALTER TABLE items ALTER COLUMN normalized_name DROP DEFAULT;
