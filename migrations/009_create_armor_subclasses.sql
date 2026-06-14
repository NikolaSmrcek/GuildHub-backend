-- Migration: Create armor_subclasses lookup table
-- Run after 008_character_fk_columns.sql
-- Run against PostgreSQL

-- ============================================================
-- ARMOR SUBCLASSES lookup table
-- Replaces the inline CHECK constraint on class_armor.armor_subclass
-- with a proper FK reference.
-- ============================================================
CREATE TABLE IF NOT EXISTS armor_subclasses (
    name VARCHAR(20) PRIMARY KEY
);

-- Seed the four valid armor types (idempotent)
INSERT INTO armor_subclasses (name) VALUES
    ('Cloth'),
    ('Leather'),
    ('Mail'),
    ('Plate')
ON CONFLICT (name) DO NOTHING;

-- Drop the old inline CHECK constraint (PostgreSQL auto-names it)
ALTER TABLE class_armor DROP CONSTRAINT IF EXISTS class_armor_armor_subclass_check;

-- Add FK constraint to the new lookup table (idempotent via DO block)
DO $$ BEGIN
    ALTER TABLE class_armor ADD CONSTRAINT fk_class_armor_armor_subclass
        FOREIGN KEY (armor_subclass) REFERENCES armor_subclasses(name);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
