import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../app.module';
import { ExpansionRepository } from '../modules/expansion/expansion.repository';
import { PatchRepository } from '../modules/patch/patch.repository';
import { seedExpansions } from './expansions.seed';
import { seedPatches } from './patches.seed';

async function bootstrapSeed() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const expansionRepo = app.get(ExpansionRepository);
  const patchRepo = app.get(PatchRepository);

  console.log('🌱 Seeding expansions...');
  await seedExpansions(expansionRepo);

  console.log('🌱 Seeding patches...');
  await seedPatches(expansionRepo, patchRepo);

  await app.close();
  console.log('✅ Seeding completed successfully.');
}

bootstrapSeed();
