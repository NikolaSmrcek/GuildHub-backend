# Loot Recommendation — Formula Specification

## Core Formula

```
totalScore = Σ (sectionScore_i × weight_i) / Σ weight_i
```

Where:

- `sectionScore_i` ∈ **[0, 100]** — output of each scoring section
- `weight_i` ∈ **[0, ∞)** — configurable per guild, default **1.0** for all sections
- If `Σ weight_i === 0` → `totalScore = 0`

The result is a single number 0–100 representing the character's recommendation priority for a specific item. Higher = more deserving.

---

## Section 1: Gear Upgrade Score

**Purpose**: How much of a DPS upgrade this item represents for the character.

**Source**: `RaidbotsReportItem.dpsImprovement` — the simulated DPS gain from equipping this item.

**Eligibility gate**: A character MUST have a Raidbots report that lists this item with `dpsImprovement > 0`. Characters without this are not candidates at all.

**Normalization** (across all eligible candidates for this item):

```
rawUpgrade_i = candidate_i.dpsImprovement
maxUpgrade   = MAX(rawUpgrade_i for all candidates)

gearScore_i = (rawUpgrade_i / maxUpgrade) × 100
```

**Edge cases**:
- Single candidate → `gearScore = 100` (they're the best by default)
- All dpsImprovement values equal → all get 100
- dpsImprovement of 0 → character is filtered out (not eligible)

---

## Section 2: Rank Score

**Purpose**: Guild-defined rank hierarchy. Higher-priority ranks (Core Raider) score higher than lower ones (Trial).

**Source**: `GuildRank.priority` — an integer 0–100 set by guild officers when defining ranks.

**Scoring**:

```
rankScore_i = candidate_i.guildRank.priority
```

This is a direct lookup — no normalization needed since priority is already 0–100.

**Example ranks**:

| Rank name | priority | → score |
|-----------|----------|---------|
| Guild Master | 100 | 100 |
| Officer | 95 | 95 |
| Core Raider | 85 | 85 |
| Raider | 60 | 60 |
| Trial | 25 | 25 |
| Social | 5 | 5 |

---

## Section 3: Loyalty Score

**Purpose**: Reward long-standing or officer-recognized members. Defaults from rank, overridable per character.

**Source**:

```
effectiveLoyalty_i = candidate_i.guildMember.loyaltyOverride
                     ?? candidate_i.guildRank.defaultLoyalty

loyaltyScore_i = effectiveLoyalty_i
```

- `loyaltyOverride` — nullable; when set by an officer, overrides the rank default
- `defaultLoyalty` — set on the rank definition, never null

Both are 0–100 integers. Direct lookup, no normalization.

---

## Section 4: Performance Score

**Purpose**: In-raid performance from WarcraftLogs. Higher percentile players are favored.

**Current implementation**: **MOCK** — returns **50** for all characters.

**Future implementation** (WarcraftLogs integration):

```
For each boss in the relevant raid, at the relevant difficulty:
  percentile = WarcraftLogs historical parse percentile (0–100)

performanceScore = AVG(percentile across all bosses in the raid)
```

Design notes:
- Which raid/difficulty to use? → Passed as context (the item's boss → raid → difficulty)
- What if character has no logs for some bosses? → Exclude missing bosses from average, or treat as 0
- Should be configurable: best% vs median% vs average%

---

## Weight Configuration

Default (all equal — each section contributes 25%):

```json
{
  "gearUpgrade": 1.0,
  "rank": 1.0,
  "loyalty": 1.0,
  "performance": 1.0
}
```

Example: loyalty-heavy guild:

```json
{
  "gearUpgrade": 1.0,
  "rank": 0.8,
  "loyalty": 2.0,
  "performance": 0.5
}
```

This means loyalty contributes 2× more than gear upgrade to the final score.

---

## Complete Walkthrough Example

**Item**: `Endless March Waistwrap` (Mythic, ilvl 519)
**Guild**: Midnight Marauders
**Weights**: All 1.0 (default)

**Candidates**:

| Character | dpsImprovement | Rank (priority) | Loyalty (effective) | Perf (mock) |
|-----------|---------------|-----------------|---------------------|-------------|
| Valena | 320 | Core Raider (85) | 80 (override) | 50 |
| Brox | 180 | Raider (60) | 60 (default) | 50 |
| Arya | 410 | Trial (25) | 25 (default) | 50 |

**Step 1 — Gear scores** (max = 410):

| Character | raw | gearScore |
|-----------|-----|-----------|
| Valena | 320 | (320/410)×100 = **78.1** |
| Brox | 180 | (180/410)×100 = **43.9** |
| Arya | 410 | (410/410)×100 = **100** |

**Step 2 — Total scores**:

| Character | gear (w=1) | rank (w=1) | loyalty (w=1) | perf (w=1) | **totalScore** |
|-----------|-----------|-----------|--------------|-----------|----------------|
| Valena | 78.1 | 85 | 80 | 50 | **(78.1+85+80+50)/4 = 73.3** |
| Brox | 43.9 | 60 | 60 | 50 | **(43.9+60+60+50)/4 = 53.5** |
| Arya | 100 | 25 | 25 | 50 | **(100+25+25+50)/4 = 50.0** |

**Result**: Valena (73.3) > Brox (53.5) > Arya (50.0)

Despite Arya having the biggest DPS upgrade, their Trial rank and low loyalty pull them down. Valena's Core Raider rank + loyalty override edge out the win.

---

## Adding a 5th Section (Example: Attendance)

1. Create `attendance.section.ts` implementing `RecommendationSection`:
   ```ts
   @Injectable()
   export class AttendanceSection implements RecommendationSection {
     name = 'attendance';
     displayName = 'Attendance';
     async calculateScore(input: SectionInput): Promise<number> {
       // query attendance records, return 0-100
     }
   }
   ```
2. Register in `RecommendationModule` providers
3. Add `"attendance": 1.0` to guild's `lootConfig.sectionWeights`
4. Done — the registry auto-discovers it, the API returns it

No changes to `RecommendationService`, the controller, or the formula.
