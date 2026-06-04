# GuildHub Project Overview

## Repository Structure
- **GuildHub-backend** — NestJS (TypeORM + PostgreSQL) backend
- **GuildHub-frontend** — Vite + React + TypeScript frontend

## Backend Key Facts
- **Framework**: NestJS with TypeORM, PostgreSQL, `pg` driver
- **Entities auto-discovered**: `__dirname + '/**/*.entity{.ts,.js}'`
- **Migrations**: Raw SQL files in `migrations/` directory
- **Modules** (all `@Global()`): ExpansionModule, PatchModule, SeasonModule, RaidModule, BossModule, DifficultyModule, ItemModule
- **Loot module** is NOT global — has its own controller (`LootController`) and service (`LootService`)
- **Circular imports**: TypeORM entities use `() => ClassName` factory pattern; circular deps between Boss ↔ Difficulty ↔ Item are fine at runtime

## Content Hierarchy (mirrors WoW data model)
```
Expansion (1) ──► (many) Patch
Season (1) ──► (many) Patch
Raid (belongs to 1 expansion, many-to-many with patches via raid_patches)
  └─ Boss (belongs to 1 raid)
       └─ Difficulty (LFR/Normal/Heroic/Mythic, belongs to 1 boss)
            └─ Item (belongs to 1 difficulty)
```

## Migration Files
1. `001_create_expansions_patches.sql` — expansions + patches
2. `002_create_content_hierarchy.sql` — seasons, raids, bosses, difficulties, items
3. `003_create_loot_council_tables.sql` — members, guilds, raid_events, loot_requests, loot_councils, council_votes, distribution_records, audit_logs

## Key Design Decisions
- **Raid** = instance definition (Voidspire); **RaidEvent** = a guild's run of a raid
- Items bound to boss per difficulty (same item name on multiple difficulties = different rows)
- LootRequest `raidId` → `raidEventId` in updated schema
- DistributionRecord `raidId` → `raidEventId`
- Council votes are immutable: UNIQUE(council_id, voter_id) prevents duplicate votes
