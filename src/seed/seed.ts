import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
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
import { GuildRank } from '../modules/guild/guild-rank.entity';
import { GuildMember } from '../modules/guild/guild-member.entity';
import { RaidbotsReport } from '../modules/raidbots/raidbots-report.entity';
import { RaidbotsReportItem } from '../modules/raidbots/raidbots-report-item.entity';
import { Item } from '../modules/item/item.entity';
import { seedExpansions } from './expansions.seed';
import { seedSeasons } from './seasons.seed';
import { seedPatches } from './patches.seed';
import { seedRaids } from './raids.seed';
import { seedCharacters } from './characters.seed';
import { seedMoreCharacters } from './more-characters.seed';
import { seedGuildRanks } from './guild-ranks.seed';
import { seedGuildMembers } from './guild-members.seed';
import { seedRaidbotsReports } from './raidbots-reports.seed';

async function bootstrapSeed() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const dataSource = app.get(DataSource);
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
  const rankRepo = app.get(getRepositoryToken(GuildRank));
  const memberRepo = app.get(getRepositoryToken(GuildMember));
  const reportRepo = app.get(getRepositoryToken(RaidbotsReport));
  const reportItemRepo = app.get(getRepositoryToken(RaidbotsReportItem));

  // ── Clear all seeded tables (reverse dependency order) ─────
  console.log('🗑️ Clearing existing seed data...');
  const queryRunner = dataSource.createQueryRunner();
  try {
    await queryRunner.query(`
      TRUNCATE TABLE
        raidbots_report_items,
        raidbots_reports,
        guild_members,
        guild_ranks,
        characters,
        accounts,
        guilds,
        items,
        difficulties,
        bosses,
        raids,
        raid_patches,
        patches,
        seasons,
        expansions
      RESTART IDENTITY CASCADE;
    `);
    console.log('✅ Seed data cleared');
  } finally {
    await queryRunner.release();
  }

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

  console.log('🌱 Seeding additional test characters...');
  await seedMoreCharacters(accountRepo, guildRepo, characterRepo);

  console.log('🌱 Seeding guild ranks...');
  await seedGuildRanks(guildRepo, rankRepo);

  console.log('🌱 Seeding guild members...');
  await seedGuildMembers(guildRepo, rankRepo, characterRepo, memberRepo);

  console.log('🌱 Seeding simulated Raidbots reports...');
  await seedRaidbotsReports(characterRepo, itemRepo, reportRepo, reportItemRepo);

  await app.close();
  console.log('✅ Seeding completed successfully.');
}

bootstrapSeed();
