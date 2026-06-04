# Common Commands

## Backend
```powershell
# TypeScript compile check (expect only @types/pg error)
npx tsc --noEmit

# NestJS dev server
npm run start:dev

# Build
npm run build
```

## Database
```powershell
# Run migrations against PostgreSQL (adjust connection params)
psql -h localhost -U postgres -d guildhub -f migrations\001_create_expansions_patches.sql
psql -h localhost -U postgres -d guildhub -f migrations\002_create_content_hierarchy.sql
psql -h localhost -U postgres -d guildhub -f migrations\003_create_loot_council_tables.sql
```

## Docker (if using docker-compose.yml)
```powershell
docker compose up -d
```

## Frontend
```powershell
cd GuildHub-frontend
npm run dev
```
