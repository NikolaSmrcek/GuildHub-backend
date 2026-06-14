-- Migration: Replace race/spec strings with FK columns on characters
-- Run after 007_create_race_class_reference.sql
-- Run against PostgreSQL

-- ============================================================
-- SPECS lookup table (UUID PK, unique class_name+spec_name)
-- Denormalized from class_specs so characters can FK to a single ID.
-- ============================================================
CREATE TABLE IF NOT EXISTS specs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name  VARCHAR(50) NOT NULL,
    spec_name   VARCHAR(50) NOT NULL,
    UNIQUE (class_name, spec_name),
    FOREIGN KEY (class_name) REFERENCES class_armor(class_name)
);

-- Populate from the already-seeded class_specs
INSERT INTO specs (class_name, spec_name)
SELECT class_name, spec_name FROM class_specs;

-- ============================================================
-- ALTER CHARACTERS
-- - race_id          UUID      FK → races(id)
-- - spec_id          UUID      FK → specs(id)
-- - player_class     VARCHAR   FK → class_armor(class_name) (existing column, add constraint)
-- - DROP old         race VARCHAR, spec VARCHAR (string columns)
-- ============================================================

-- Add new FK columns
ALTER TABLE characters ADD COLUMN IF NOT EXISTS race_id UUID REFERENCES races(id);
ALTER TABLE characters ADD COLUMN IF NOT EXISTS spec_id UUID REFERENCES specs(id);

-- Add FK on existing player_class column
DO $$ BEGIN
    ALTER TABLE characters ADD CONSTRAINT fk_characters_player_class
        FOREIGN KEY (player_class) REFERENCES class_armor(class_name);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Drop old string columns (now replaced by FK columns)
ALTER TABLE characters DROP COLUMN IF EXISTS race;
ALTER TABLE characters DROP COLUMN IF EXISTS spec;

-- Index new FK columns
CREATE INDEX IF NOT EXISTS idx_characters_race_id ON characters(race_id);
CREATE INDEX IF NOT EXISTS idx_characters_spec_id ON characters(spec_id);
