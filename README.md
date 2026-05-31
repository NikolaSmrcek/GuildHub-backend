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

Production
----------

Build and run:

```bash
npm run build
npm run start:prod
```

Helpful tips
------------

- Use `nvm use` after creating `.nvmrc` to pick the correct Node version.
- Keep `.env.example` up-to-date with required keys (no secrets).
