GuildHub Backend
=================

NestJS + TypeScript + Fastify — minimal starter configuration and run instructions.

Prerequisites
-------------

- Node.js (use `nvm` to manage versions)
- npm or yarn

Setup
-----

1. Install dependencies:

```bash
cd GuildHub-backend
npm install
# or: yarn
```

2. Copy environment file:

```bash
cp .env.example .env
# then edit .env with real values
```

API Documentation (Swagger)
---------------------------

When the server is running, Swagger UI is available at:

```
http://localhost:3000/api/docs
```

The OpenAPI spec is auto-generated from NestJS decorators (`@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`, etc.) using `@nestjs/swagger`. The document is built in `src/main.ts` with the `DocumentBuilder`.

Development
-----------

Run the NestJS app with Fastify adapter in watch mode (typical script names):

```bash
npm run start:dev
```

If you don't have these scripts in package.json, add:

```json
"scripts": {
  "start": "node dist/main.js",
  "start:dev": "nest start --watch",
  "build": "nest build",
  "start:prod": "node dist/main.js"
}
```

Notes:

- NestJS supports Fastify via the `@nestjs/platform-fastify` package. Initialize the app with `NestFactory.create(AppModule, new FastifyAdapter())`.
- Example `main.ts` boot snippet:

```ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
```

Environment variables
---------------------

- `PORT` — HTTP port (default: 3000)
- `NODE_ENV` — `development` | `production`
- `DATABASE_URL` — DB connection string
- `JWT_SECRET` — JWT signing secret

Add any other variables your app requires to `.env` and `.env.example`.

Docker
------

### Prerequisites

- Docker and Docker Compose
- `.env` file configured (copy from `.env.example`)

### Production

Build the production image (multi-stage: `npm ci` → `npm run build` → run compiled JS):

```bash
docker compose up --build
```

Only rebuild the backend image if source changed without bringing Postgres down:

```bash
docker compose build backend
docker compose up backend
```

### Development (hot-reload)

The dev service uses `Dockerfile.dev` with `ts-node-dev` for watch mode and mounts `./src` and `./migrations` so changes reflect instantly:

```bash
docker compose --profile dev up --build backend-dev
```

To start only the Postgres service without the backend (run backend natively):

```bash
docker compose up -d postgres
npm run start:dev
```

### Services

| Service | Profile | Dockerfile | Source |
|---------|---------|------------|--------|
| `backend` | _(default)_ | `Dockerfile` | Built into image |
| `backend-dev` | `dev` | `Dockerfile.dev` | Mounted from host via volumes |

Native (without Docker)
-----------------------

Build and run:

```bash
npm run build
npm run start:prod
```

Or in development mode with hot-reload:

```bash
npm run start:dev
```

Helpful tips
------------

- Use `nvm use` after creating `.nvmrc` to pick the correct Node version.
- Keep `.env.example` up-to-date with required keys (no secrets).
- Docker caches layers aggressively — run `docker compose build --no-cache backend` if you hit stale build issues.
