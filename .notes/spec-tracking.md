# SPEC Tracking

## Current SPEC.md Location
- Backend: `GuildHub-backend/SPEC.md`
- Frontend: `GuildHub-frontend/SPEC.md`

## Key SPEC Changes Made
- Added Content Hierarchy section (Expansion → Patch → Season → Raid → Boss → Difficulty → Item)
- Updated Data Models with JSON schemas for Expansion, Patch, Season, Raid, Boss, Difficulty, Item
- Item schema has **TODO** marker for attributes (stats, sockets, effects) — to be expanded later
- Split API Endpoints into "Content / Catalog" and "Guild-scoped / Loot Council"
- Renamed `raidId` → `raidEventId` in LootRequest and DistributionRecord schemas
- Added content seeding flow alongside loot council flow

## Current Migration Files
- `001` — expansions + patches
- `002` — seasons, raids, bosses, difficulties, items (new content hierarchy)
- `003` — loot council tables (members, guilds, raid_events, etc.)

## Next Steps (not yet implemented)
- Content catalog CRUD endpoints (GET /api/expansions, /api/raids, etc.)
- Loot council service/controller logic
- Item attributes expansion
