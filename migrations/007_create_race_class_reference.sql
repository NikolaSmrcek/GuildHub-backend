-- Migration: Create race/class/spec/armor reference tables
-- Run after 006_create_guild_ranks_members.sql
-- Run against PostgreSQL

-- ============================================================
-- RACES (playable races with faction)
-- Dual-faction races (Dracthyr, Pandaren, Earthen) get one row
-- per faction. UNIQUE(name, faction) allows this.
-- ============================================================
CREATE TABLE IF NOT EXISTS races (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name    VARCHAR(50) NOT NULL,
    faction VARCHAR(20) NOT NULL,
    UNIQUE (name, faction)
);

-- ============================================================
-- RACE ↔ CLASS (which race can play which class)
-- ============================================================
CREATE TABLE IF NOT EXISTS race_classes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id     UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    class_name  VARCHAR(50) NOT NULL,
    UNIQUE (race_id, class_name)
);

CREATE INDEX IF NOT EXISTS idx_race_classes_race_id ON race_classes(race_id);
CREATE INDEX IF NOT EXISTS idx_race_classes_class_name ON race_classes(class_name);

-- ============================================================
-- CLASS ↔ SPEC (which spec belongs to which class)
-- ============================================================
CREATE TABLE IF NOT EXISTS class_specs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name  VARCHAR(50) NOT NULL,
    spec_name   VARCHAR(50) NOT NULL,
    UNIQUE (class_name, spec_name)
);

CREATE INDEX IF NOT EXISTS idx_class_specs_class_name ON class_specs(class_name);

-- ============================================================
-- CLASS ↔ ARMOR (primary armor type for each class)
-- ============================================================
CREATE TABLE IF NOT EXISTS class_armor (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name      VARCHAR(50) NOT NULL UNIQUE,
    armor_subclass  VARCHAR(20) NOT NULL CHECK (armor_subclass IN ('Cloth', 'Leather', 'Mail', 'Plate'))
);

-- ============================================================
-- ADD RACE TO CHARACTERS
-- ============================================================
ALTER TABLE characters ADD COLUMN IF NOT EXISTS race VARCHAR(50);
