# SPEC Tracking

## Current SPEC.md Location
- Backend: `GuildHub-backend/SPEC.md`
- Frontend: `GuildHub-frontend/SPEC.md`

## Current Iteration: Content Catalog
- Content domain: Expansion, Patch, Season, Raid, Boss, Difficulty, Item (bound to boss per difficulty)
- Focus is content hierarchy seeding and read endpoints
- Loot council removed from scope — deferred to future iteration

## Key SPEC Changes Made
- Added Content Hierarchy section (Expansion → Patch → Season → Raid → Boss → Difficulty → Item)
- Updated Data Models with JSON schemas for Expansion, Patch, Season, Raid, Boss, Difficulty, Item
- Item schema has **TODO** marker for attributes (stats, sockets, effects) — to be expanded later
- All loot council references marked as **TODO** (endpoints, flow, tests, glossary terms)
- Content seeding flow is current focus

## Current Migration Files
- `001` — expansions + patches
- `002` — seasons, raids, bosses, difficulties, items

## Next Steps (not yet implemented)
- Content catalog read endpoints (GET /api/expansions, /api/patches, /api/seasons, /api/raids, /api/bosses, /api/items)
- Content seeding for seasons, raids, bosses, difficulties, items
- Item attributes expansion
