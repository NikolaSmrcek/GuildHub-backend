# Entity Relationships (TypeORM)

## Account
- `@OneToMany(() => Character)` → characters
- Fields: email (unique), displayName, isActive, isDeleted (soft-delete)

## Character
- `@ManyToOne(() => Account)` → account (FK on account_id, NO cascade — soft-delete only)
- `@ManyToOne(() => Guild)` → guild (FK on guild_id, nullable, NO cascade)
- `@OneToMany(() => RaidbotsReport)` → raidbotsReports
- Fields: name, realm, faction, playerClass, spec, itemLevel, isDeleted (soft-delete)

## Guild
- `@OneToMany(() => Character)` → characters
- Fields: name, realm, faction, guildType, isDeleted (soft-delete)

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
