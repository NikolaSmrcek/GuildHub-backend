import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../app.module';
import { ExpansionRepository } from '../modules/expansion/expansion.repository';
import { PatchRepository } from '../modules/patch/patch.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Season } from '../modules/season/season.entity';
import { Raid } from '../modules/raid/raid.entity';
import { Boss } from '../modules/boss/boss.entity';
import { Difficulty } from '../modules/difficulty/difficulty.entity';
import { Account } from '../modules/account/account.entity';
import { Guild } from '../modules/guild/guild.entity';
import { Character } from '../modules/character/character.entity';
import { Item } from '../modules/item/item.entity';
import { seedExpansions } from './expansions.seed';
import { seedSeasons } from './seasons.seed';
import { seedPatches } from './patches.seed';
import { seedRaids } from './raids.seed';
import { seedCharacters } from './characters.seed';

async function bootstrapSeed() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const expansionRepo = app.get(ExpansionRepository);
  const patchRepo = app.get(PatchRepository);
  const seasonRepo = app.get(getRepositoryToken(Season));
  const raidRepo = app.get(getRepositoryToken(Raid));
  const bossRepo = app.get(getRepositoryToken(Boss));
  const difficultyRepo = app.get(getRepositoryToken(Difficulty));
  const itemRepo = app.get(getRepositoryToken(Item));
  const accountRepo = app.get(getRepositoryToken(Account));
  const guildRepo = app.get(getRepositoryToken(Guild));
  const characterRepo = app.get(getRepositoryToken(Character));

  console.log('🌱 Seeding expansions...');
  await seedExpansions(expansionRepo);

  const allExpansions = await expansionRepo.findAll();
  const expansionIdByShortName: Record<string, string> = {};
  for (const exp of allExpansions) {
    expansionIdByShortName[exp.shortName] = exp.id;
  }

  console.log('🌱 Seeding seasons...');
  await seedSeasons(seasonRepo, expansionIdByShortName);

  console.log('🌱 Seeding patches...');
  await seedPatches(expansionRepo, patchRepo, seasonRepo);

  console.log('🌱 Seeding raids, bosses, difficulties, items...');
  await seedRaids(expansionRepo, raidRepo, bossRepo, difficultyRepo, itemRepo);

  console.log('🌱 Seeding characters (Aurelora)...');
  await seedCharacters(accountRepo, guildRepo, characterRepo);

  await app.close();
  console.log('✅ Seeding completed successfully.');
}

bootstrapSeed();
