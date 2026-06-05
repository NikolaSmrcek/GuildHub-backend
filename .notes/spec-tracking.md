# SPEC Tracking

## Current SPEC.md Location
- Backend: `GuildHub-backend/SPEC.md`
- Frontend: `GuildHub-frontend/SPEC.md`

## Current Iteration: Content Catalog + Identity Models
- Content domain: Expansion, Patch, Season, Raid, Boss, Difficulty, Item (bound to boss per difficulty)
- Identity domain: Account, Character, Guild
- Soft-delete pattern on all identity entities

## Key SPEC Changes Made
- Added Account / Character / Guild relationship section and JSON schemas
- Added Account (1) → (many) Character, Guild (1) → (many) Character
- All identity entities use `isDeleted` soft-delete (no cascade)
- Updated Data Models with JSON schemas for Expansion, Patch, Season, Raid, Boss, Difficulty, Item
- Item schema has **TODO** marker for attributes (stats, sockets, effects) — to be expanded later

## Current Migration Files
- `001` — expansions + patches
- `002` — seasons, raids, bosses, difficulties, items
- `003` — accounts, characters, guilds (soft-delete)

## Completed
- ✅ Account, Character, Guild entities with TypeORM relationships
- ✅ AccountModule, CharacterModule, GuildModule registered in AppModule
- ✅ Migration `003_create_accounts_characters_guilds.sql` (soft-delete, no cascade)
- ✅ Frontend types (Account, Character, Guild with isDeleted)
- ✅ Content seeding for midnight raids (Voidspire, Dreamrift, March on Quel'Danas) with correct item data

## Next Steps (not yet implemented)
- Content catalog read endpoints (GET /api/expansions, /api/patches, /api/seasons, /api/raids, /api/bosses, /api/items)
- Account/Character/Guild CRUD endpoints
- JWT auth tying login to Account entity
- Item attributes expansion
- Loot council domain (deferred)
- Sporefall raid (releasing June 16, 2026)
