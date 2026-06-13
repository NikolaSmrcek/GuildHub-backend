# Loot Recommendation Engine — Implementation Plan

## Summary

Build a modular, configurable scoring engine that ranks guild members (characters) for a specific item. The engine combines 4 scoring sections via weighted average into a 0–100 total score. Weights and ranks are configurable per guild.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  RecommendationService                           │
│  ┌───────────────────────────────────────────┐  │
│  │  Section Registry                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │ Gear     │ │ Rank     │ │ Loyalty  │  │  │
│  │  │ Upgrade  │ │ Score    │ │ Score    │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘  │  │
│  │  ┌──────────┐ ┌──────────────────────┐   │  │
│  │  │ Perf…    │ │  (future sections…)  │   │  │
│  │  └──────────┘ └──────────────────────┘   │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  Eligibility Filter:                             │
│  1. Character is on guild's raid roster          │
│  2. Character has a Raidbots report with this     │
│     item listed as a DPS improvement              │
│                                                  │
│  Formula:                                        │
│  totalScore = Σ(secScore_i × weight_i) / Σ(weight_i) │
└─────────────────────────────────────────────────┘
```

## New Entities

| Entity | Purpose | Key fields |
|--------|---------|------------|
| `GuildRank` | Ranks defined per guild (Core Raider, Trial, etc.) | name, priority (0–100), defaultLoyalty (0–100) |
| `GuildMember` | Character's membership in a guild — rank, loyalty override, raid roster flag | guildId, characterId, rankId, loyaltyOverride (nullable), isOnRaidRoster |
| Guild.lootConfig | Per-guild section weights | JSONB: `{ gearUpgrade, rank, loyalty, performance }` — all default 1.0 |

Full details: [data-model.md](data-model.md)

## Implementation Steps

### Step 1: New entities + migration

- Create `GuildRank` entity — belongs to Guild, has priority/defaultLoyalty
- Create `GuildMember` entity — bridges Character ↔ Guild with rank + loyalty + roster flag
- Add `lootConfig` JSONB column to `guilds` table
- Write migration `006_create_guild_ranks_members.sql`
- Register in `GuildModule`

### Step 2: Section strategy interface + registry

- Define `RecommendationSection` interface (name, calculateScore)
- Build `RecommendationSectionRegistry` — collects all sections via DI
- Ensures adding a 5th section later = one new class + `@Injectable()` + register in module

### Step 3: Implement the 4 sections

| Section | Source | Scoring logic |
|---------|--------|---------------|
| Gear Upgrade | `RaidbotsReportItem.dpsImprovement` | Normalized: `(dpsImprovement / maxAmongCandidates) × 100` |
| Rank | `GuildRank.priority` | Direct: `rank.priority` (0–100) |
| Loyalty | `GuildMember.loyaltyOverride ?? GuildRank.defaultLoyalty` | Direct (0–100) |
| Performance | Mock | Returns 50 for all characters; TODO for WarcraftLogs integration |

### Step 4: RecommendationService

- Accepts `(guildId, itemId)`
- Loads guild config (weights), guild members on raid roster
- Filters eligible characters (must have Raidbots report with dpsImprovement > 0 for this item)
- Runs all sections for each candidate
- Computes weighted average → totalScore
- Returns sorted list (highest score first)

### Step 5: API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/guilds/:guildId/recommendations/items/:itemId` | Get ranked recommendations for an item |
| `GET` | `/api/guilds/:guildId/loot-config` | Get current section weights |
| `PUT` | `/api/guilds/:guildId/loot-config` | Update section weights |

Full API spec: [api-spec.md](api-spec.md)

### Step 6: Rank + member management endpoints (CRUD)

| Method | Path | Purpose |
|--------|------|---------|
| `GET/POST` | `/api/guilds/:guildId/ranks` | List / create ranks |
| `PUT/DELETE` | `/api/guilds/:guildId/ranks/:rankId` | Update / delete rank |
| `GET/PUT` | `/api/guilds/:guildId/members/:characterId` | Get / update member (rank, loyalty, roster) |
| `GET` | `/api/guilds/:guildId/members` | List all members |

## Directory Layout (new files)

```
src/modules/
  recommendation/                    # NEW module
    recommendation.module.ts
    recommendation.controller.ts
    recommendation.service.ts
    recommendation.types.ts          # interfaces, DTOs
    sections/                        # One file per section
      section.interface.ts           # RecommendationSection interface
      section-registry.ts            # Collects all sections
      gear-upgrade.section.ts
      rank.section.ts
      loyalty.section.ts
      performance.section.ts
  guild/
    guild-rank.entity.ts             # NEW
    guild-member.entity.ts           # NEW
    guild.service.ts                 # NEW (or extend existing)
    guild.controller.ts              # NEW (or extend existing)
migrations/
  006_create_guild_ranks_members.sql # NEW
```

## Risks / Open Questions

1. **Performance section mock**: Returns flat 50. WarcraftLogs integration will need OAuth + API client — deferred.
2. **Normalization edge case**: If only 1 candidate, their gear upgrade score is always 100 (best among themselves). This is intentional — single-candidate means they get it.
3. **Raid roster management**: No CRUD yet for managing the roster. The `isOnRaidRoster` flag on GuildMember handles it; roster management endpoints can be added later if needed beyond direct DB updates.
4. **Weight config validation**: Weights must be ≥ 0. If all weights sum to 0, totalScore = 0.
