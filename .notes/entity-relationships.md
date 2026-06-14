# Entity Relationships (TypeORM)

## Account
- `@OneToMany(() => Character)` → characters
- Fields: email (unique), displayName, isActive, isDeleted (soft-delete)

## Character
- `@ManyToOne(() => Account)` → account (FK on account_id, NO cascade — soft-delete only)
- `@ManyToOne(() => Guild)` → guild (FK on guild_id, nullable, NO cascade)
- `@ManyToOne(() => Race)` → race (FK on race_id, nullable, added in migration 008)
- `@ManyToOne(() => Spec)` → spec (FK on spec_id, nullable, added in migration 008)
- `@OneToMany(() => RaidbotsReport)` → raidbotsReports
- `playerClass` VARCHAR — FK → class_armor(class_name) via `fk_characters_player_class` (migration 008, NOT VALID)
- Fields: name, realm, faction, playerClass, itemLevel, isDeleted (soft-delete)

## Race
- `@OneToMany(() => RaceClass)` → raceClasses via race_id
- `@OneToMany(() => Character)` (via race_id FK on characters)
- Fields: name, faction — `UNIQUE(name, faction)` allows dual-faction races (Dracthyr, Pandaren, Earthen)

## RaceClass
- `@ManyToOne(() => Race)` → race (FK on race_id, ON DELETE CASCADE)
- `@Unique(['raceId', 'className'])` — one combination per race
- Fields: raceId, className

## ClassSpec
- `@Unique(['className', 'specName'])` — one spec per class
- Fields: className, specName

## ClassArmor
- `@ManyToOne(() => ArmorSubclass)` → armorSubclass (FK on armor_subclass, added in migration 009)
- `@Unique(['className'])` — one armor type per class
- Fields: className, armorSubclass

## ArmorSubclass
- Lookup table seeded with 4 fixed values: Cloth, Leather, Mail, Plate
- `@OneToMany(() => ClassArmor)` (via armor_subclass FK on class_armor)
- Fields: name (PK)

## Spec
- Denormalized from ClassSpec so characters can FK to a single ID
- `@Unique(['className', 'specName'])`
- `@ManyToOne(() => ClassArmor)` via FK (class_name) → class_armor(class_name)
- Fields: className, specName
- Populated by migration 008 INSERT FROM class_specs, re-seeded in seed step 6

## Guild
- `@OneToMany(() => Character)` → characters
- `@OneToMany(() => GuildRank)` → ranks (via guildId)
- `@OneToMany(() => GuildMember)` → members (via guildId)
- `lootConfig` JSONB column — per-guild section weights for recommendation engine
- Fields: name, realm, faction, guildType, isDeleted (soft-delete)

## GuildRank
- `@ManyToOne(() => Guild)` → guild (FK on guild_id, ON DELETE CASCADE)
- `@OneToMany(() => GuildMember)` → members (via rankId)
- Unique name per guild (business rule, not a DB unique constraint — enforced by seed idempotency)
- Fields: name, priority (0-100), defaultLoyalty (0-100)

## GuildMember
- `@ManyToOne(() => Guild)` → guild (FK on guild_id, ON DELETE CASCADE)
- `@ManyToOne(() => Character)` → character (FK on character_id, ON DELETE CASCADE)
- `@ManyToOne(() => GuildRank)` → rank (FK on rank_id, ON DELETE RESTRICT)
- `UNIQUE(guild_id, character_id)` — one membership record per character per guild
- Fields: loyaltyOverride (nullable, 0-100), isOnRaidRoster (boolean)

## Expansion
- `@OneToMany(() => Patch)` → patches
- `@OneToMany(() => Raid)` → raids (via expansionId)

## Patch
- `@ManyToOne(() => Expansion)` → expansion
- `@ManyToOne(() => Season)` → season (nullable seasonId)
- `@ManyToMany(() => Raid)` via raid_patches junction table

## Season
- `@OneToMany(() => Patch)` → patches

## Raid
- `@ManyToMany(() => Patch)` via raid_patches junction table
- `@OneToMany(() => Boss)` → bosses

## Boss
- `@ManyToOne(() => Raid)` → raid
- `@OneToMany(() => Difficulty)` → difficulties

## Difficulty
- `@ManyToOne(() => Boss)` → boss
- `@OneToMany(() => Item)` → items
- Enum: `DifficultyName` = LFR, Normal, Heroic, Mythic

## Item
- `@ManyToOne(() => Difficulty)` → difficulty
- `@OneToOne(() => RaidbotsReportItem)` → raidbotsReportItem (FK on raidbots_report_items.item_id)
- Fields: name, ilvl, slot, class, subclass

## RaidbotsReport
- `@ManyToOne(() => Character)` → character (FK on character_id)
- `@OneToMany(() => RaidbotsReportItem)` → reportItems
- Fields: reportUrl, playerName, playerClass, playerSpec, playerDpsMean, isValid, rawData (JSONB)

## RaidbotsReportItem
- `@ManyToOne(() => RaidbotsReport)` → report (FK on report_id, ON DELETE CASCADE)
- `@OneToOne(() => Item)` → item (FK on item_id, UNIQUE — one item per report item)
- Fields: itemName, playerDpsMean, upgradeDpsMean, dpsImprovement

## PatchRepository
- `findAll()` / `findById()` / `findByExpansionId()` include `relations: { expansion: true, season: true }`
