# Loot Recommendation — API Specification

All endpoints are guild-scoped under `/api/guilds/:guildId`.

---

## 1. Get Loot Recommendations for an Item

```
GET /api/guilds/:guildId/recommendations/items/:itemId
```

Returns eligible characters ranked by recommendation score (descending).

### Response `200 OK`

```json
{
  "itemId": "a1b2c3d4-...",
  "itemName": "Endless March Waistwrap",
  "ilvl": 519,
  "bossName": "Imperator Averzian",
  "difficulty": "Mythic",
  "raidName": "Voidspire",
  "weights": {
    "gearUpgrade": 1.0,
    "rank": 1.0,
    "loyalty": 1.0,
    "performance": 1.0
  },
  "candidates": [
    {
      "characterId": "c1-...",
      "characterName": "Valena",
      "accountDisplayName": "Alice",
      "playerClass": "Priest",
      "spec": "Holy",
      "rankName": "Core Raider",
      "totalScore": 73.3,
      "sectionScores": {
        "gearUpgrade": { "score": 78.1, "weight": 1.0 },
        "rank": { "score": 85, "weight": 1.0 },
        "loyalty": { "score": 80, "weight": 1.0 },
        "performance": { "score": 50, "weight": 1.0 }
      }
    },
    {
      "characterId": "c2-...",
      "characterName": "Brox",
      "accountDisplayName": "Bob",
      "playerClass": "Warrior",
      "spec": "Protection",
      "rankName": "Raider",
      "totalScore": 53.5,
      "sectionScores": {
        "gearUpgrade": { "score": 43.9, "weight": 1.0 },
        "rank": { "score": 60, "weight": 1.0 },
        "loyalty": { "score": 60, "weight": 1.0 },
        "performance": { "score": 50, "weight": 1.0 }
      }
    }
  ]
}
```

### Behavior

1. Load guild's `lootConfig.sectionWeights` (default: all 1.0)
2. Find all `GuildMember` rows for this guild where `isOnRaidRoster = true`
3. For each member's character, check if they have a `RaidbotsReport` containing a `RaidbotsReportItem` linked to this item with `dpsImprovement > 0`
4. Run all registered sections for each candidate
5. Compute weighted average → totalScore
6. Sort descending by totalScore

### Error responses

| Status | When |
|--------|------|
| `404` | Guild not found, or item not found |
| `200 []` | No eligible candidates (empty `candidates` array) |

---

## 2. Get Loot Configuration

```
GET /api/guilds/:guildId/loot-config
```

### Response `200 OK`

```json
{
  "guildId": "g1-...",
  "sectionWeights": {
    "gearUpgrade": 1.0,
    "rank": 1.0,
    "loyalty": 1.0,
    "performance": 1.0
  }
}
```

If `lootConfig` is null on the guild, returns default weights (all 1.0) for all registered sections.

---

## 3. Update Loot Configuration

```
PUT /api/guilds/:guildId/loot-config
```

### Request Body

```json
{
  "sectionWeights": {
    "gearUpgrade": 1.0,
    "rank": 0.8,
    "loyalty": 2.0,
    "performance": 0.5
  }
}
```

- All section keys are optional — only sent keys are updated (partial merge)
- Unknown section keys are ignored (allows forward-compat: a new section appears, old configs still work)
- Negative weights → `400 Bad Request`

### Response `200 OK`

Returns the full merged config (same shape as GET).

---

## 4. Guild Ranks CRUD

### List ranks

```
GET /api/guilds/:guildId/ranks
```

```json
[
  {
    "id": "r1-...",
    "name": "Core Raider",
    "priority": 85,
    "defaultLoyalty": 70
  },
  {
    "id": "r2-...",
    "name": "Trial",
    "priority": 25,
    "defaultLoyalty": 20
  }
]
```

### Create rank

```
POST /api/guilds/:guildId/ranks
```

```json
{
  "name": "Officer",
  "priority": 95,
  "defaultLoyalty": 90
}
```

→ `201 Created` with the new GuildRank object.

### Update rank

```
PUT /api/guilds/:guildId/ranks/:rankId
```

```json
{
  "priority": 90,
  "defaultLoyalty": 85
}
```

→ `200 OK` with updated GuildRank.

### Delete rank

```
DELETE /api/guilds/:guildId/ranks/:rankId
```

→ `204 No Content`

Fails with `409 Conflict` if any GuildMember still references this rank.

---

## 5. Guild Members Management

### List members

```
GET /api/guilds/:guildId/members
```

Query params: `?onRoster=true` to filter to raid roster only.

```json
[
  {
    "id": "m1-...",
    "characterId": "c1-...",
    "characterName": "Valena",
    "accountDisplayName": "Alice",
    "rankId": "r1-...",
    "rankName": "Core Raider",
    "loyaltyOverride": 80,
    "isOnRaidRoster": true
  }
]
```

### Add character to guild (create member)

```
POST /api/guilds/:guildId/members
```

```json
{
  "characterId": "c1-...",
  "rankId": "r1-...",
  "loyaltyOverride": null,
  "isOnRaidRoster": true
}
```

→ `201 Created`

### Update member

```
PUT /api/guilds/:guildId/members/:characterId
```

```json
{
  "rankId": "r2-...",
  "loyaltyOverride": 75,
  "isOnRaidRoster": true
}
```

All fields optional — only sent fields are updated.

→ `200 OK`

### Remove member from guild

```
DELETE /api/guilds/:guildId/members/:characterId
```

→ `204 No Content`

---

## Notes

- **Authentication**: All endpoints require auth middleware (stubbed for now, enforced later)
- **Authorization**: Only guild officers should modify ranks, members, and loot config (stubbed)
- **Idempotency**: PUT config/member/rank are idempotent
- **Performance**: Target < 300ms for recommendation endpoint with ≤ 30 candidates
