# Race / Class / Spec / Armor Validation — Implementation Plan

## Summary

Add reference tables and validation logic that enforce WoW rules:
- **Race ↔ Class**: Not every race can be every class (e.g., only Night Elf & Blood Elf can be Demon Hunters)
- **Class ↔ Spec**: Specs are tied to class (e.g., "Holy" exists for both Priest and Paladin — but the pair matters)
- **Class ↔ Armor Type**: Each class has exactly one primary armor type (Cloth, Leather, Mail, Plate)
- **Item armor ↔ Character class**: An item's armor subclass must match the character's class armor type

All validation functions are **internal-only** (called by services, not exposed via API).

## New Entities

### Race

```
Race (id, name, faction)
```

One race can have many characters. A character has exactly one race.

### RaceClass (junction)

```
RaceClass (race_id, class_name)
```

Pre-computed reference: which race can play which class. Prevents invalid combos at the DB level.

### ClassSpec (junction)

```
ClassSpec (class_name, spec_name)

Example rows:
  Priest | Holy
  Priest | Discipline
  Priest | Shadow
  Paladin | Holy
  Paladin | Protection
  Paladin | Retribution
```

### ClassArmor (reference)

```
ClassArmor (class_name, armor_subclass)

Example rows:
  Mage    | Cloth
  Rogue   | Leather
  Hunter  | Mail
  Warrior | Plate
```

One class → one armor type (never changes in WoW).

Full details: [data-model.md](data-model.md)

## Changes to Existing Entities

### Character

Add column:
- `race` VARCHAR(50) — the character's race (was previously missing)

### Item

No schema change — `subclass` column already stores armor type (Cloth/Leather/Mail/Plate) or weapon type (Sword, Dagger, etc.).

## Validation Functions (Internal Only)

All live in a dedicated service — `src/modules/validation/`:

| Function | Purpose | Where called |
|----------|---------|-------------|
| `validateRaceClass(race, className)` | Check race can be this class | Character creation/update, seed |
| `validateClassSpec(className, spec)` | Check spec belongs to class | Character creation/update, seed |
| `validateClassArmor(className, armorSubclass)` | Check armor type matches class | `RaidbotsService.createReport()` |
| `validateCharacterCombination(race, className, spec)` | All three checks at once | Seed scripts, character service |

Full details: [validation-logic.md](validation-logic.md)

## Integration: RaidbotsService.createReport()

After matching an item in the report, validate that the item's armor type matches the character's class:

```ts
// In raidbots.service.ts — after finding matchedItem, before pushing to upgrades[]
if (!this.validationService.validateClassArmor(character.playerClass, matchedItem.subclass)) {
  this.logger.debug('Skipping item — armor type mismatch', {
    characterClass: character.playerClass,
    itemSubclass: matchedItem.subclass,
  });
  continue;
}
```

This prevents e.g. a Paladin (Plate) from getting cloth item upgrades suggested.

## Seed Data

Full reference data to seed (see [seed-data.md](seed-data.md)):

| Table | Rows | Example |
|-------|------|---------|
| `races` | 30 | Human (Alliance), Dracthyr (Alliance), Dracthyr (Horde), … |
| `race_classes` | ~190 | (Night Elf, Druid) ✓, (Gnome, Shaman) ✗ |
| `class_specs` | 39 | (Priest, Holy), (Paladin, Holy), (Mage, Fire), (Demon Hunter, Havoc), (Demon Hunter, Vengeance), … |
| `class_armor` | 13 | (Mage, Cloth), (Hunter, Mail), … |

> Dracthyr is seeded as two rows (Alliance + Horde) sharing identical race↔class combos. `races` table uses `UNIQUE(name, faction)` to allow this.

### Character Seed — 16 Characters (4 per Armor Type)

| Armor | Count | On Roster | Off Roster | Classes |
|-------|-------|-----------|------------|---------|
| **Cloth** | 4 | 3 | 1 | Priest (Holy), Mage (Fire), Warlock (Affliction), Priest (Shadow) |
| **Leather** | 4 | 3 | 1 | Druid (Balance), Rogue (Assassination), Monk (Windwalker), Demon Hunter (Havoc) |
| **Mail** | 4 | 3 | 1 | Shaman (Restauration), Shaman (Elemental), Hunter (Marksmanship), Hunter (Beast Mastery) |
| **Plate** | 4 | 3 | 1 | Paladin (Retribution), Warrior (Protection), Death Knight (Blood), Paladin (Holy) |

> 12 on raid roster (eligible for recommendations), 4 off-roster (verify eligibility filter excludes them). All race+class+spec combos validated against the race-class grid. See [seed-data.md](seed-data.md) for the full table.

### Raidbots Report Items — ≥4 per Character

Each of the 16 characters gets **at least 4 RaidbotsReportItems** (≥64 total report items across the seed). Every item matches the character's class armor type — validated by `validateClassArmor()`. dpsImprovement values span 50–500 for varied recommendation scores. All items sourced from Voidspire Mythic bosses.

### Raidbots Report Item Fix (existing Paladin+Cloth mismatch)

**Problem**: Current `raidbots-reports.seed.ts` links ALL characters to "Endless March Waistwrap" (Cloth) — including Plate-wearers. This is an armor mismatch.

**Fix**: With the armor validation in place, each character only gets report items matching their class armor type. See [seed-data.md](seed-data.md) for the item mapping.

## Migration

- `007_create_race_class_reference.sql` — races, race_classes, class_specs, class_armor tables
- Add `race` column to characters table

## Directory Layout (new files)

```
src/modules/
  validation/                           # NEW module
    validation.module.ts
    validation.service.ts
    validation.constants.ts             # In-memory fallback maps (fast lookups without DB)
migrations/
  007_create_race_class_reference.sql   # NEW
src/seed/
  race-reference.seed.ts                # NEW — all reference data
```

Full details in each sub-document within this plan directory.
