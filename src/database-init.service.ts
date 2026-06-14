import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import { ExpansionRepository } from './modules/expansion/expansion.repository';
import { PatchRepository } from './modules/patch/patch.repository';
import { Season } from './modules/season/season.entity';
import { Raid } from './modules/raid/raid.entity';
import { Boss } from './modules/boss/boss.entity';
import { Difficulty } from './modules/difficulty/difficulty.entity';
import { Item } from './modules/item/item.entity';
import { Account } from './modules/account/account.entity';
import { Guild } from './modules/guild/guild.entity';
import { Character } from './modules/character/character.entity';
import { GuildRank } from './modules/guild/guild-rank.entity';
import { GuildMember } from './modules/guild/guild-member.entity';
import { RaidbotsReport } from './modules/raidbots/raidbots-report.entity';
import { RaidbotsReportItem } from './modules/raidbots/raidbots-report-item.entity';
import { seedExpansions } from './seed/expansions.seed';
import { seedSeasons } from './seed/seasons.seed';
import { seedPatches } from './seed/patches.seed';
import { seedRaids } from './seed/raids.seed';
import { seedCharacters } from './seed/characters.seed';
import { seedMoreCharacters } from './seed/more-characters.seed';
import { seedGuildRanks } from './seed/guild-ranks.seed';
import { seedGuildMembers } from './seed/guild-members.seed';
import { seedRaidbotsReports } from './seed/raidbots-reports.seed';
import { ConfigService } from './config.service';
import { GuildHubLogger } from './shared/logger';

@Injectable()
export class DatabaseInitService implements OnApplicationBootstrap {
  private readonly logger = new GuildHubLogger(DatabaseInitService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly expansionRepo: ExpansionRepository,
    private readonly patchRepo: PatchRepository,
    @InjectRepository(Season) private readonly seasonRepo: Repository<Season>,
    @InjectRepository(Raid) private readonly raidRepo: Repository<Raid>,
    @InjectRepository(Boss) private readonly bossRepo: Repository<Boss>,
    @InjectRepository(Difficulty) private readonly difficultyRepo: Repository<Difficulty>,
    @InjectRepository(Item) private readonly itemRepo: Repository<Item>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.configService.runMigrations) {
      await this.runMigrations();
    } else {
      this.logger.info('Skipping migrations (RUN_MIGRATIONS=false)');
    }

    if (this.configService.runSeeds) {
      await this.runSeeds();
    } else {
      this.logger.info('Skipping seeds (RUN_SEEDS=false)');
    }
  }

  private async runMigrations(): Promise<void> {
    const client = new Client({
      host: this.configService.dbHost,
      port: this.configService.dbPort,
      user: this.configService.dbUser,
      password: this.configService.dbPassword,
      database: this.configService.dbName,
    });

    try {
      await client.connect();
      this.logger.info('Connected to database for migrations');

      // Read and execute migration files in order
      // In dev (ts-node) __dirname is src/, in prod (compiled) it's dist/
      const migrationsDir = join(__dirname, '..', 'migrations');
      const migrationFiles = [
        '001_create_expansions_patches.sql',
        '002_create_content_hierarchy.sql',
        '003_create_accounts_characters_guilds.sql',
        '004_create_raidbots_reports.sql',
        '005_add_normalized_name_to_items.sql',
        '006_create_guild_ranks_members.sql',
      ];

      for (const file of migrationFiles) {
        const filePath = join(migrationsDir, file);
        try {
          const sql = readFileSync(filePath, 'utf-8');
          this.logger.info(`Running migration: ${file}`);
          await client.query(sql);
          this.logger.info(`✅ Migration ${file} completed`);
        } catch {
          this.logger.warn(`Migration file ${file} not found, skipping`);
        }
      }
    } finally {
      await client.end();
    }
  }

  private async runSeeds(): Promise<void> {
    // Clear all seeded tables (reverse dependency order) so seeds always start fresh
    this.logger.info('🗑️ Clearing existing seed data...');
    const queryRunner = this.dataSource.createQueryRunner();
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
      this.logger.info('✅ Seed data cleared');
    } finally {
      await queryRunner.release();
    }

    this.logger.info('🌱 Seeding expansions...');
    await seedExpansions(this.expansionRepo);

    // Build expansion lookup for season seeding
    const allExpansions = await this.expansionRepo.findAll();
    const expansionIdByShortName: Record<string, string> = {};
    for (const exp of allExpansions) {
      expansionIdByShortName[exp.shortName] = exp.id;
    }

    this.logger.info('🌱 Seeding seasons...');
    await seedSeasons(this.seasonRepo, expansionIdByShortName);

    this.logger.info('🌱 Seeding patches...');
    await seedPatches(this.expansionRepo, this.patchRepo, this.seasonRepo);

    this.logger.info('🌱 Seeding raids, bosses, difficulties, items...');
    await seedRaids(
      this.expansionRepo,
      this.raidRepo,
      this.bossRepo,
      this.difficultyRepo,
      this.itemRepo,
    );

    this.logger.info('🌱 Seeding characters (Aurelora)...');
    const accountRepo = this.dataSource.getRepository(Account);
    const guildRepo = this.dataSource.getRepository(Guild);
    const characterRepo = this.dataSource.getRepository(Character);
    await seedCharacters(accountRepo, guildRepo, characterRepo);

    this.logger.info('🌱 Seeding additional test characters...');
    await seedMoreCharacters(accountRepo, guildRepo, characterRepo);

    this.logger.info('🌱 Seeding guild ranks...');
    const rankRepo = this.dataSource.getRepository(GuildRank);
    await seedGuildRanks(guildRepo, rankRepo);

    this.logger.info('🌱 Seeding guild members...');
    const memberRepo = this.dataSource.getRepository(GuildMember);
    await seedGuildMembers(guildRepo, rankRepo, characterRepo, memberRepo);

    this.logger.info('🌱 Seeding simulated Raidbots reports...');
    const reportRepo = this.dataSource.getRepository(RaidbotsReport);
    const reportItemRepo = this.dataSource.getRepository(RaidbotsReportItem);
    await seedRaidbotsReports(characterRepo, this.itemRepo, reportRepo, reportItemRepo);

    this.logger.info('✅ Database seeding completed');
  }
}
