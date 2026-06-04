# Entity Relationships (TypeORM)

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
- Fields: name, ilvl, slot, class, subclass

## PatchRepository
- `findAll()` / `findById()` / `findByExpansionId()` include `relations: { expansion: true, season: true }`
