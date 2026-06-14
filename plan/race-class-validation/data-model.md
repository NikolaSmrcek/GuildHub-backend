# Race / Class Validation — Data Model

## Entity Relationship Diagram

```
Race (1) ──► (many) Character
Character ──► (1) Race (new column: race)

Race ──► RaceClass (race_id, class_name)
Class ──► ClassSpec (class_name, spec_name)
Class ──► ClassArmor (class_name, armor_subclass)
```

Classes are stored as **string enums** (not a separate class entity) since they're a fixed WoW concept that rarely changes. The reference tables use `class_name` as a VARCHAR to validate against.

---

## New Entity: Race

```json
{
  "$id": "Race",
  "type": "object",
  "required": ["id", "name", "faction"],
  "properties": {
    "id": { "type": "string", "description": "UUID" },
    "name": { "type": "string", "example": "Human" },
    "faction": { "type": "string", "enum": ["Alliance", "Horde"] }
  }
}
```

**TypeORM entity** (`src/modules/validation/race.entity.ts`):

```ts
@Entity('races')
export class Race {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 50, unique: true })
  name!: string;

  @Column({ length: 20 })
  faction!: string; // 'Alliance' | 'Horde' — dual-faction races (Dracthyr, Pandaren, Earthen) get one row per faction
}
```

---

## New Entity: RaceClass

```json
{
  "$id": "RaceClass",
  "type": "object",
  "required": ["raceId", "className"],
  "properties": {
    "raceId": { "type": "string", "description": "UUID — FK to races.id" },
    "className": { "type": "string", "example": "Paladin" }
  }
}
```

**TypeORM entity** (`src/modules/validation/race-class.entity.ts`):

```ts
@Entity('race_classes')
@Unique(['raceId', 'className'])
export class RaceClass {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'race_id' })
  raceId!: string;

  @ManyToOne(() => Race)
  @JoinColumn({ name: 'race_id' })
  race!: Race;

  @Column({ name: 'class_name', length: 50 })
  className!: string;
}
```

---

## New Entity: ClassSpec

```json
{
  "$id": "ClassSpec",
  "type": "object",
  "required": ["className", "specName"],
  "properties": {
    "className": { "type": "string", "example": "Priest" },
    "specName": { "type": "string", "example": "Holy" }
  }
}
```

**TypeORM entity** (`src/modules/validation/class-spec.entity.ts`):

```ts
@Entity('class_specs')
@Unique(['className', 'specName'])
export class ClassSpec {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'class_name', length: 50 })
  className!: string;

  @Column({ name: 'spec_name', length: 50 })
  specName!: string;
}
```

---

## New Entity: ClassArmor

```json
{
  "$id": "ClassArmor",
  "type": "object",
  "required": ["className", "armorSubclass"],
  "properties": {
    "className": { "type": "string", "example": "Mage" },
    "armorSubclass": { "type": "string", "enum": ["Cloth", "Leather", "Mail", "Plate"] }
  }
}
```

**TypeORM entity** (`src/modules/validation/class-armor.entity.ts`):

```ts
@Entity('class_armor')
@Unique(['className'])
export class ClassArmor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'class_name', length: 50, unique: true })
  className!: string;

  @Column({ name: 'armor_subclass', length: 20 })
  armorSubclass!: string; // 'Cloth', 'Leather', 'Mail', 'Plate'
}
```

---

## Changes to Character Entity

Add one column:

```ts
@Column({ length: 50, nullable: true })
race!: string;
```

The `race` column stores the race name string (e.g., "Human", "Night Elf"). It's nullable to support existing data and gradual migration, but validated at the application level.

---

## Migration: `007_create_race_class_reference.sql`

```sql
-- ============================================================
-- RACES
-- ============================================================
CREATE TABLE IF NOT EXISTS races (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name    VARCHAR(50) NOT NULL,
    faction VARCHAR(20) NOT NULL,
    UNIQUE (name, faction)  -- Dracthyr can appear in both Alliance and Horde
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
```

---

## Reference: Armor Types (Fixed — never changes)

| Armor Type | Classes wearing it |
|-----------|-------------------|
| **Cloth** | Mage, Priest, Warlock |
| **Leather** | Rogue, Monk, Druid, Demon Hunter |
| **Mail** | Hunter, Shaman, Evoker |
| **Plate** | Warrior, Paladin, Death Knight |

---

## Reference: All 13 Classes

| # | Class | Armor | Specs (3 per class, except DH=2, Evoker=3, Druid=4) |
|---|-------|-------|------|
| 1 | Warrior | Plate | Arms, Fury, Protection |
| 2 | Paladin | Plate | Holy, Protection, Retribution |
| 3 | Death Knight | Plate | Blood, Frost, Unholy |
| 4 | Hunter | Mail | Beast Mastery, Marksmanship, Survival |
| 5 | Shaman | Mail | Elemental, Enhancement, Restoration |
| 6 | Evoker | Mail | Devastation, Preservation, Augmentation |
| 7 | Rogue | Leather | Assassination, Outlaw, Subtlety |
| 8 | Monk | Leather | Brewmaster, Mistweaver, Windwalker |
| 9 | Druid | Leather | Balance, Feral, Guardian, Restoration |
| 10 | Demon Hunter | Leather | Havoc, Vengeance |
| 11 | Mage | Cloth | Arcane, Fire, Frost |
| 12 | Priest | Cloth | Discipline, Holy, Shadow |
| 13 | Warlock | Cloth | Affliction, Demonology, Destruction |
