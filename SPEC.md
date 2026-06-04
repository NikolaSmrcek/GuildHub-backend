# GuildHub Backend — SPEC: Item Distribution / Loot Council (Patch 12.0.5)

Purpose
-------

This document is a clear, model-friendly specification for the first backend iteration of GuildHub focused on item distribution (loot council). It targets retail patch 12.0.5.

Goals
-----

- Provide endpoints and data models to track items, loot requests, distribution decisions, and council votes.
- Support auditability and replayability of distribution decisions.
- Be extensible for future distribution methods (need before/after, DKP, random roll).

Scope (Iteration 1)
-------------------

- Core domain: Guild, Member, Raid, Item, LootRequest, DistributionRecord, CouncilVote.
- Content domain: Expansion, Patch, Season, Raid (instance), Boss, Difficulty, Item (bound to boss per difficulty).
- API endpoints for creating items, submitting loot requests, opening a council decision, casting votes, and recording final distribution.
- Persistence-ready models (JSON schemas included). Authentication/authorization will be stubbed as placeholders.

Out of scope
------------

- UI/Frontend details, real-time websockets (can be added later), advanced reputation/DKP algorithms, cross-guild federation.

Patch target
------------

- Retail patch: 12.0.5 — this only affects content metadata (item ids/names) and does not change backend APIs.

Stakeholders
------------

- Raid leaders and loot council members.
- Guild officers and members.
- Backend engineers and future AI agents that will extend features.

Content Hierarchy
-----------------

The World of Warcraft content tree is modeled as follows:

```
Expansion (1) ──► (many) Patch
   │                              Season (1) ──► (many) Patch
   │
   └── Raid (belongs to 1 expansion, 1+ patches)
         │
         Boss (belongs to 1 raid)
           │
           Difficulty (belongs to 1 boss)
             │
             Item (belongs to 1 boss per difficulty)
```

### Hierarchy rules

- **Expansion** → has many **Patches** (e.g. Midnight has patches 12.0.0, 12.0.2, 12.0.5).
- **Patch** → belongs to exactly one **Expansion**. Has exactly one **Season**. A Season spans one or more patches.
- **Season** → has many **Patches** (e.g. Season 1 spans patches 12.0.0 and 12.0.5).
- **Raid** (instance) → belongs to exactly one **Expansion** and at least one **Patch**. A raid can be available in multiple patches of the same expansion (e.g. "Voidspire" available in 12.0.0 and 12.0.5).
- **Boss** → belongs to exactly one **Raid**. A raid has one to many bosses.
- **Difficulty** → belongs to exactly one **Boss**. Every boss has entries for one or more of: `LFR`, `Normal`, `Heroic`, `Mythic`.
- **Item** → belongs to exactly one **Boss** per **Difficulty**. Items are bound to a specific boss+difficulty combination. The same item may exist on multiple difficulties with different attributes (ilvl, stats).

### Example: Midnight expansion

```
Midnight (expansion)
├── Patch 12.0.0 ───── Season 1
├── Patch 12.0.2 ───── Season 1
├── Patch 12.0.5 ───── Season 1
│
├── Voidspire (raid)
│   ├── Imperator Averzian (boss)
│   │   ├── LFR           → [Endless March Waistwrap (ilvl 480), ...]
│   │   ├── Normal        → [Endless March Waistwrap (ilvl 493), ...]
│   │   ├── Heroic        → [Endless March Waistwrap (ilvl 506), ...]
│   │   └── Mythic        → [Endless March Waistwrap (ilvl 519), ...]
│   ├── ... (5 more bosses)
│
├── Dreamrift (raid)
│   ├── ... bosses ...
│
└── March on Quel'Danas (raid)
    ├── ... bosses ...
```

### Example: Season 1

```
Season 1
├── Patch 12.0.0 (Voidspire, Dreamrift, March on Quel'Danas)
└── Patch 12.0.5 (Voidspire, Dreamrift, March on Quel'Danas)
```

Core Concepts & Terms
---------------------

- **Expansion**: A major World of Warcraft release (e.g. Midnight). Contains multiple patches and raids.
- **Patch**: A content update within an expansion (e.g. 12.0.5). Belongs to exactly one expansion and exactly one season.
- **Season**: A competitive PvE season spanning one or more patches (e.g. Season 1 spans 12.0.0 and 12.0.5).
- **Raid** (instance): A instanced PvE zone belonging to one expansion and at least one patch. Has one or more bosses.
- **Boss**: An encounter within a raid. Has one or more difficulties.
- **Difficulty**: A difficulty tier for a boss encounter — one of `LFR`, `Normal`, `Heroic`, `Mythic`. Items drop at this level.
- **Item**: Dropped loot bound to a specific boss/difficulty combination. Attributes (ilvl, stats) vary by difficulty.
- **Guild**: Container for members and raids.
- **Member**: A user in the guild (id, displayName, roles).
- **Raid** (event): An occurrence where a guild runs a raid instance (timestamp, zone, attendees). Links to the raid instance definition.
- **LootRequest**: Member requests an item (request reason, timestamp, priority).
- **LootCouncil**: A decision session for one or more items within a raid event.
- **CouncilVote**: A vote by a council member for/against/abstain and optional weight or comment.
- **DistributionRecord**: Final assignment of an item (recipient, timestamp, rationale).

Acceptance Criteria (Iteration 1)
--------------------------------

- Create/list items and raids.
- Members can submit loot requests for items from a raid.
- Officers can create a LootCouncil session tied to a raid and one or more items.
- Council members can vote; system records votes immutably.
- An officer can finalize distribution for an item; system creates DistributionRecord and marks requests as resolved.

Security & Privacy
------------------

- Store no plaintext secrets in the API responses. Use `JWT` or session tokens (implementation detail later).
- Audit logs for distribution decisions must be append-only.

Non-Functional Requirements
---------------------------

- API must respond within 300ms for typical requests.
- Models must be serializable to JSON and compatible with common ORMs.

Data Models (JSON Schema)
-------------------------

Member
------

```json
{
  "$id": "Member",
  "type": "object",
  "required": ["id", "displayName"],
  "properties": {
    "id": {"type": "string", "description": "UUID"},
    "displayName": {"type": "string"},
    "roles": {"type": "array", "items": {"type": "string"}}
  }
}
```

Expansion
---------

```json
{
  "$id": "Expansion",
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id": {"type": "string", "description": "UUID"},
    "name": {"type": "string"},
    "shortName": {"type": "string"},
    "releaseDate": {"type": "string", "format": "date"}
  }
}
```

Patch
-----

```json
{
  "$id": "Patch",
  "type": "object",
  "required": ["id", "patchNumber", "expansionId"],
  "properties": {
    "id": {"type": "string", "description": "UUID"},
    "expansionId": {"type": "string", "description": "UUID — parent Expansion"},
    "patchNumber": {"type": "string", "example": "12.0.5"},
    "name": {"type": "string"},
    "releaseDate": {"type": "string", "format": "date"},
    "seasonId": {"type": "string", "description": "UUID — parent Season"}
  }
}
```

Season
------

```json
{
  "$id": "Season",
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id": {"type": "string", "description": "UUID"},
    "name": {"type": "string", "example": "Season 1"},
    "expansionId": {"type": "string", "description": "UUID — owning expansion (optional, for convenience)"}
  }
}
```

Raid (instance definition)
--------------------------

```json
{
  "$id": "Raid",
  "type": "object",
  "required": ["id", "name", "expansionId"],
  "properties": {
    "id": {"type": "string", "description": "UUID"},
    "name": {"type": "string", "example": "Voidspire"},
    "expansionId": {"type": "string", "description": "UUID — parent Expansion"},
    "patchIds": {"type": "array", "items": {"type": "string"}, "description": "UUIDs — one or more Patches this raid is available in"},
    "order": {"type": "integer", "description": "Display order within the expansion"}
  }
}
```

Boss
----

```json
{
  "$id": "Boss",
  "type": "object",
  "required": ["id", "name", "raidId"],
  "properties": {
    "id": {"type": "string", "description": "UUID"},
    "name": {"type": "string", "example": "Imperator Averzian"},
    "raidId": {"type": "string", "description": "UUID — parent Raid"},
    "order": {"type": "integer", "description": "Encounter order within the raid"}
  }
}
```

Difficulty
----------

```json
{
  "$id": "Difficulty",
  "type": "object",
  "required": ["id", "bossId", "difficulty"],
  "properties": {
    "id": {"type": "string", "description": "UUID"},
    "bossId": {"type": "string", "description": "UUID — parent Boss"},
    "difficulty": {"type": "string", "enum": ["LFR", "Normal", "Heroic", "Mythic"]}
  }
}
```

Item
----

```json
{
  "$id": "Item",
  "type": "object",
  "required": ["id", "name", "difficultyId"],
  "properties": {
    "id": {"type": "string"},
    "name": {"type": "string"},
    "difficultyId": {"type": "string", "description": "UUID — parent Difficulty"},
    "ilvl": {"type": "integer"},
    "slot": {"type": "string", "description": "Equipment slot (optional, e.g. Waist, Chest, Weapon)"},
    "class": {"type": "string", "description": "Item class (optional, e.g. Armor, Weapon)"},
    "subclass": {"type": "string", "description": "Item subclass (optional, e.g. Cloth, Plate, Sword)"}
  }
}
```

> **TODO**: Item attributes (stats, sockets, effects, etc.) to be expanded in a later iteration.
```

LootRequest
-----------

```json
{
  "$id": "LootRequest",
  "type": "object",
  "required": ["id","raidId","itemId","requesterId","timestamp"],
  "properties": {
    "id": {"type": "string"},
    "raidEventId": {"type": "string", "description": "UUID — the raid event, not the instance definition"},
    "itemId": {"type": "string"},
    "requesterId": {"type": "string"},
    "priority": {"type": "string", "enum": ["offspec","main"]},
    "reason": {"type": "string"},
    "timestamp": {"type": "string", "format": "date-time"},
    "status": {"type": "string", "enum": ["open","resolved","withdrawn"], "default": "open"}
  }
}
```

CouncilVote
-----------

```json
{
  "$id": "CouncilVote",
  "type": "object",
  "required": ["id","councilId","voterId","vote","timestamp"],
  "properties": {
    "id": {"type": "string"},
    "councilId": {"type": "string"},
    "voterId": {"type": "string"},
    "vote": {"type": "string", "enum": ["yes","no","abstain"]},
    "weight": {"type": "number", "default": 1},
    "comment": {"type": "string"},
    "timestamp": {"type": "string", "format": "date-time"}
  }
}
```

DistributionRecord
------------------

```json
{
  "$id": "DistributionRecord",
  "type": "object",
  "required": ["id","itemId","recipientId","finalizedBy","timestamp"],
  "properties": {
    "id": {"type": "string"},
    "raidEventId": {"type": "string"},
    "itemId": {"type": "string"},
    "recipientId": {"type": "string"},
    "finalizedBy": {"type": "string"},
    "rationale": {"type": "string"},
    "timestamp": {"type": "string", "format": "date-time"}
  }
}
```

API Endpoints (REST-style)
--------------------------

Notes: use authentication middleware; endpoints use guild-scoped routes (prefix: `/api/guilds/:guildId`).

### Content / Catalog endpoints

- `GET /api/expansions` — list expansions
- `GET /api/expansions/:id` — get expansion with patches
- `GET /api/patches` — list patches
- `GET /api/patches/:id` — get patch with details
- `GET /api/seasons` — list seasons
- `GET /api/seasons/:id` — get season with patches
- `GET /api/raids` — list raid instances
- `GET /api/raids/:id` — get raid with bosses, difficulties, items
- `GET /api/bosses` — list bosses
- `GET /api/bosses/:id` — get boss with difficulties and items
- `GET /api/items` — list items (query params: expansionId, raidId, bossId, difficulty, patch)
- `GET /api/items/:id` — get item details

### Guild-scoped / Loot Council endpoints

- `POST /api/guilds/:guildId/raids` — create raid event
- `GET /api/guilds/:guildId/raids` — list raid events
- `POST /api/guilds/:guildId/items` — create item (obsolete once content catalog is populated; kept for manual overrides)
- `GET /api/guilds/:guildId/items` — list items (includes catalog + custom)
- `POST /api/guilds/:guildId/raids/:raidEventId/items/:itemId/requests` — create loot request
- `GET /api/guilds/:guildId/raids/:raidEventId/requests` — list requests for raid event
- `POST /api/guilds/:guildId/raids/:raidEventId/councils` — create LootCouncil session (items[])
- `POST /api/guilds/:guildId/councils/:councilId/votes` — cast a CouncilVote
- `POST /api/guilds/:guildId/councils/:councilId/finalize` — finalize distribution for an item (body: itemId, recipientId, rationale)

Example: finalize request body

```json
{
  "itemId": "item-uuid",
  "recipientId": "member-uuid",
  "rationale": "Consensus by council: highest need"
}
```

Event flows (simplified)
------------------------

### Content seeding flow
1. System seeds **Expansions** (e.g. "Midnight").
2. Each expansion seeds its **Patches** (e.g. 12.0.0, 12.0.5) and **Seasons** (e.g. Season 1).
3. Each patch seeds **Raids** (instances like "Voidspire") — raids link to one expansion and one or more patches.
4. Each raid seeds **Bosses** (e.g. "Imperator Averzian").
5. Each boss seeds **Difficulties** (LFR, Normal, Heroic, Mythic).
6. Each difficulty seeds **Items** — the same item name may appear on multiple difficulties with different ilvls.

### Loot council flow
1. Raid event occurs, items recorded.
2. Members submit `LootRequest` entries for items within the raid event.
3. Officer opens a `LootCouncil` session referencing the raid event and items.
4. Council members cast `CouncilVote`s; votes are stored immutably.
5. Officer finalizes distribution for an item; system creates `DistributionRecord` and marks related `LootRequest`s as `resolved`.
6. Audit log captures the finalized payload.

Testing & Validation
--------------------

- Unit tests for controllers, services, and vote aggregation logic.
- Integration tests for the finalize flow (requests -> votes -> distribution record).

Milestones (first 2 sprints)
---------------------------

Sprint 1
- Implement content data models and persistence (Expansion, Patch, Season, Raid, Boss, Difficulty, Item).
- Implement core loot domain models (Member, Guild, LootRequest, LootCouncil, CouncilVote, DistributionRecord).
- Implement endpoints: create/list raids, items, requests.

Sprint 2
- Implement council session endpoints, voting, finalize flow, and audit logs.
- Add tests and basic documentation.

Acceptance test scenarios (examples)
----------------------------------

- Scenario A: Single item, two requests, council with three voters yields unanimous `yes`; finalize assigns to requester A and marks requests resolved.
- Scenario B: Vote ties — officer must choose; finalize still records rationale and votes.

Implementation notes for engineers and AI agents
---------------------------------------------

- Keep domain models small and explicit; store timestamps in ISO 8601.
- Design APIs to be idempotent where possible (e.g., casting the same vote twice should be rejected or update the previous vote).
- Store votes and distributions immutably to support audits.
- Items are bound to a specific boss+difficulty combination. The same item name may appear on multiple difficulties with different ilvls.
- Raids belong to one expansion and one or more patches (many-to-many via junction table). A raid available in multiple patches is still the same raid instance definition.
- A Season spans one or more patches. Each patch belongs to exactly one season.
- A `RaidEvent` (the occurrence of a guild running a raid) references the `Raid` instance definition plus a timestamp, attendees, etc.

Glossary
-------

- **Loot Council**: a group of trusted officers who decide item recipients.
- **Offspec**: item for secondary/alternate character.
- **LFR**: Looking For Raid — the easiest difficulty tier.
- **Raid Event**: a specific occurrence of a guild running a raid instance (as opposed to the raid instance definition).

Files to add in repo (suggested)
-------------------------------

- `src/modules/loot/*` — controllers, services, models, DTOs.
- `src/modules/expansion/*` — expansion CRUD.
- `src/modules/patch/*` — patch CRUD.
- `src/modules/season/*` — season entity + module.
- `src/modules/raid/*` — raid instance entity + module (the definition, not events).
- `src/modules/boss/*` — boss entity + module.
- `src/modules/difficulty/*` — difficulty entity + module.
- `src/modules/item/*` — item entity + module (content catalog).
- `tests/loot/*` — unit and integration tests.
- `migrations/*` — initial schema for chosen ORM.

End of SPEC
