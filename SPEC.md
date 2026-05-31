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

Core Concepts & Terms
---------------------

- Guild: container for members and raids.
- Member: a user in the guild (id, displayName, roles).
- Raid: an event where loot drops occur (timestamp, zone, attendees).
- Item: dropped loot (id, name, ilvl, sourcePatch).
- LootRequest: member requests an item (request reason, timestamp, priority).
- LootCouncil: a decision session for one or more items within a raid.
- CouncilVote: a vote by a council member for/against/abstain and optional weight or comment.
- DistributionRecord: final assignment of an item (recipient, timestamp, rationale).

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

Item
----

```json
{
  "$id": "Item",
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id": {"type": "string"},
    "name": {"type": "string"},
    "ilvl": {"type": "integer"},
    "sourcePatch": {"type": "string", "description": "e.g. 12.0.5"}
  }
}
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
    "raidId": {"type": "string"},
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
    "raidId": {"type": "string"},
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

- GET `/api/guilds/:guildId/raids` — list raids
- POST `/api/guilds/:guildId/raids` — create raid
- GET `/api/guilds/:guildId/items` — list items
- POST `/api/guilds/:guildId/items` — create item (include `sourcePatch`)
- POST `/api/guilds/:guildId/raids/:raidId/items/:itemId/requests` — create loot request
- GET `/api/guilds/:guildId/raids/:raidId/requests` — list requests for raid
- POST `/api/guilds/:guildId/raids/:raidId/councils` — create LootCouncil session (items[])
- POST `/api/guilds/:guildId/councils/:councilId/votes` — cast a CouncilVote
- POST `/api/guilds/:guildId/councils/:councilId/finalize` — finalize distribution for an item (body: itemId, recipientId, rationale)

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

1. Raid occurs, items recorded.
2. Members submit `LootRequest` entries for items within the raid.
3. Officer opens a `LootCouncil` session referencing the raid and items.
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
- Implement data models and persistence adapters (in-memory + one ORM mapping example).
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
- Include `sourcePatch` on `Item` to filter/query content specific to 12.0.5.

Glossary
-------

- Loot Council: a group of trusted officers who decide item recipients.
- Offspec: item for secondary/alternate character.

Files to add in repo (suggested)
-------------------------------

- `src/modules/loot/*` — controllers, services, models, DTOs.
- `tests/loot/*` — unit and integration tests.
- `migrations/*` — initial schema for chosen ORM.

End of SPEC
