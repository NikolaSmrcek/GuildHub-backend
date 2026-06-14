# GuildHub Project Overview

## Repository Structure
- **GuildHub-backend** — NestJS (TypeORM + PostgreSQL) backend
- **GuildHub-frontend** — Vite + React + TypeScript frontend

## Backend Key Facts
- **Framework**: NestJS with TypeORM, PostgreSQL, `pg` driver
- **Entities auto-discovered**: `__dirname + '/**/*.entity{.ts,.js}'`
- **Migrations**: Raw SQL files in `migrations/` directory
- **Content modules** (all `@Global()`): ExpansionModule, PatchModule, SeasonModule, RaidModule, BossModule, DifficultyModule, ItemModule
- **Identity modules** (non-global, export TypeOrmModule): AccountModule, CharacterModule, GuildModule
- **GuildModule** expanded: registers GuildRank + GuildMember entities, exposes GuildService + GuildController (rank/member/loot-config CRUD)
- **Loot module** is NOT global — has its own controller (`LootController`) and service (`LootService`)
- **Recommendation module** (`RecommendationModule`) — modular scoring engine using strategy pattern:
  - `RecommendationSection` interface with 4 implementations: GearUpgradeSection, RankSection, LoyaltySection, PerformanceSection (mock)
  - Sections registered via `RECOMMENDATION_SECTION` DI token (factory injection)
  - `RecommendationSectionRegistry` collects all sections and runs them against each candidate
  - `RecommendationService` orchestrates eligibility filtering + weighted average scoring
  - `GET /api/guilds/:guildId/recommendations/items/:itemId`
- **Circular imports**: TypeORM entities use `() => ClassName` factory pattern; circular deps between Boss ↔ Difficulty ↔ Item are fine at runtime

## Soft-Delete Pattern
- **All identity entities** (Account, Character, Guild) use `isDeleted` boolean (default false) instead of cascade/SET NULL deletes
- No `ON DELETE CASCADE` or `ON DELETE SET NULL` on foreign keys — records are flagged, never removed
- `is_deleted` indexes exist on all three tables for filtered queries

## Account / Character / Guild Relationships
```
Account (1) ──► (many) Character
Guild (1) ──► (many) Character
Character (belongs to 1 account, belongs to 1 guild)
```

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
3. `003_create_accounts_characters_guilds.sql` — accounts, characters, guilds (soft-delete)
4. `004_create_raidbots_reports.sql` — raidbots_reports + raidbots_report_items
5. `005_add_normalized_name_to_items.sql` — normalized_name column on items
6. `006_create_guild_ranks_members.sql` — guild_ranks, guild_members tables + loot_config JSONB on guilds

## Key Design Decisions
- **Raid** = instance definition (Voidspire); **RaidEvent** = a guild's run of a raid
- Items bound to boss per difficulty (same item name on multiple difficulties = different rows)
- **Soft-delete**: Account/Character/Guild use `isDeleted` flag instead of cascade deletes
- LootRequest `raidId` → `raidEventId` in updated schema
- DistributionRecord `raidId` → `raidEventId`
- Council votes are immutable: UNIQUE(council_id, voter_id) prevents duplicate votes
- **Recommendation scoring**: weighted average formula — `totalScore = Σ(secScore × weight) / Σ(weight)`. Weights configurable per guild via `lootConfig` JSONB.
- **Modular sections**: Each scoring section implements `RecommendationSection` interface. Registered via DI token `RECOMMENDATION_SECTION` (factory pattern). Adding a 5th section = one new class + inject in factory.
- **Eligibility gates**: Candidate must be on guild's raid roster (`isOnRaidRoster=true`) AND have a Raidbots report showing `dpsImprovement > 0` for the item.
- **GuildRank DELETE restricted**: GuildMember references rank with `ON DELETE RESTRICT` — ranks with assigned members can't be deleted.
- **Plan documentation**: Feature plans stored in `plan/<feature-name>/` — `plan/loot-recommendation/` contains plan, formula, data model, and API spec for the recommendation engine.
