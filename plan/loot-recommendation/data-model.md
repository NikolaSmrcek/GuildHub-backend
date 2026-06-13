# Loot Recommendation — Data Model

## Entity Relationship Diagram

```
Guild (1) ──────► (many) GuildRank
Guild (1) ──────► (many) GuildMember
GuildMember ─────► (1) Character
GuildMember ─────► (1) GuildRank
Character (1) ──► (many) RaidbotsReport
RaidbotsReport ──► (many) RaidbotsReportItem
RaidbotsReportItem ──► (1) Item
```

---

## New Entity: GuildRank

Defined per guild. Each guild has its own rank hierarchy.

```json
{
  "$id": "GuildRank",
  "type": "object",
  "required": ["id", "guildId", "name", "priority", "defaultLoyalty"],
  "properties": {
    "id": { "type": "string", "description": "UUID" },
    "guildId": { "type": "string", "description": "UUID — parent Guild" },
    "name": { "type": "string", "example": "Core Raider" },
    "priority": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "description": "Higher = better priority for loot. Directly used as rank score."
    },
    "defaultLoyalty": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "description": "Default loyalty score for members of this rank. Overridable per member."
    }
  }
}
```

**TypeORM entity** (`src/modules/guild/guild-rank.entity.ts`):

```ts
@Entity('guild_ranks')
export class GuildRank {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'guild_id' })
  guildId!: string;

  @ManyToOne(() => Guild, (guild) => guild.ranks)
  @JoinColumn({ name: 'guild_id' })
  guild!: Guild;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'integer', default: 50 })
  priority!: number;       // 0-100

  @Column({ name: 'default_loyalty', type: 'integer', default: 50 })
  defaultLoyalty!: number; // 0-100

  @OneToMany(() => GuildMember, (member) => member.rank)
  members!: GuildMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
```

**Guild entity changes** — add relations + lootConfig:

```ts
// Add to Guild entity:
@OneToMany(() => GuildRank, (rank) => rank.guild)
ranks!: GuildRank[];

@OneToMany(() => GuildMember, (member) => member.guild)
members!: GuildMember[];

@Column({ name: 'loot_config', type: 'jsonb', nullable: true })
lootConfig!: LootConfig;
```

Where `LootConfig`:

```ts
interface LootConfig {
  sectionWeights: Record<string, number>; // e.g. { "gearUpgrade": 1.0, "rank": 1.0, ... }
}
```

Default (when null): all known sections weight 1.0.

---

## New Entity: GuildMember

Bridges a Character to a Guild, carrying rank assignment, loyalty override, and raid roster status.

```json
{
  "$id": "GuildMember",
  "type": "object",
  "required": ["id", "guildId", "characterId", "rankId", "isOnRaidRoster"],
  "properties": {
    "id": { "type": "string", "description": "UUID" },
    "guildId": { "type": "string", "description": "UUID — parent Guild" },
    "characterId": { "type": "string", "description": "UUID — the Character" },
    "rankId": { "type": "string", "description": "UUID — assigned GuildRank" },
    "loyaltyOverride": {
      "type": ["integer", "null"],
      "minimum": 0,
      "maximum": 100,
      "description": "Officer-set override for loyalty. Null means use rank defaultLoyalty."
    },
    "isOnRaidRoster": {
      "type": "boolean",
      "description": "Whether this character is on the guild's raid roster. Only roster members are eligible for recommendations."
    }
  }
}
```

**TypeORM entity** (`src/modules/guild/guild-member.entity.ts`):

```ts
@Entity('guild_members')
@Unique(['guildId', 'characterId'])
export class GuildMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'guild_id' })
  guildId!: string;

  @ManyToOne(() => Guild, (guild) => guild.members)
  @JoinColumn({ name: 'guild_id' })
  guild!: Guild;

  @Column({ name: 'character_id' })
  characterId!: string;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'character_id' })
  character!: Character;

  @Column({ name: 'rank_id' })
  rankId!: string;

  @ManyToOne(() => GuildRank, (rank) => rank.members)
  @JoinColumn({ name: 'rank_id' })
  rank!: GuildRank;

  @Column({ name: 'loyalty_override', type: 'integer', nullable: true })
  loyaltyOverride!: number | null;  // 0-100, null = use rank default

  @Column({ name: 'is_on_raid_roster', type: 'boolean', default: false })
  isOnRaidRoster!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
```

---

## Migration: `006_create_guild_ranks_members.sql`

```sql
-- ============================================================
-- GUILD RANKS
-- ============================================================
CREATE TABLE IF NOT EXISTS guild_ranks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    priority        INTEGER NOT NULL DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
    default_loyalty INTEGER NOT NULL DEFAULT 50 CHECK (default_loyalty >= 0 AND default_loyalty <= 100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guild_ranks_guild_id ON guild_ranks(guild_id);

-- ============================================================
-- GUILD MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS guild_members (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id            UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    character_id        UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    rank_id             UUID NOT NULL REFERENCES guild_ranks(id) ON DELETE RESTRICT,
    loyalty_override    INTEGER CHECK (loyalty_override >= 0 AND loyalty_override <= 100),
    is_on_raid_roster   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guild_members_guild_char ON guild_members(guild_id, character_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_rank_id ON guild_members(rank_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_roster ON guild_members(guild_id, is_on_raid_roster);

-- ============================================================
-- GUILD LOOT CONFIG (JSONB column on guilds)
-- ============================================================
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS loot_config JSONB;
```

---

## Existing Entities Touched

| Entity | Change |
|--------|--------|
| `Guild` | Add `ranks` relation, `members` relation, `lootConfig` JSONB column |
| `Character` | No changes needed — link is through GuildMember |
| `Account` | No changes needed |

## Existing Modules Touched

| Module | Change |
|--------|--------|
| `GuildModule` | Register GuildRank, GuildMember entities; add GuildService, GuildController |
| `RecommendationModule` | **New** — depends on GuildModule, RaidbotsModule, CharacterModule |
