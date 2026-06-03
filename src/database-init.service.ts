import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import { ExpansionRepository } from './modules/expansion/expansion.repository';
import { PatchRepository } from './modules/patch/patch.repository';
import { seedExpansions } from './seed/expansions.seed';
import { seedPatches } from './seed/patches.seed';
import { ConfigService } from './config.service';

@Injectable()
export class DatabaseInitService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly expansionRepo: ExpansionRepository,
    private readonly patchRepo: PatchRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.configService.runMigrations) {
      await this.runMigrations();
    } else {
      this.logger.log('Skipping migrations (RUN_MIGRATIONS=false)');
    }

    if (this.configService.runSeeds) {
      await this.runSeeds();
    } else {
      this.logger.log('Skipping seeds (RUN_SEEDS=false)');
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
      this.logger.log('Connected to database for migrations');

      // Read and execute migration files in order
      // In dev (ts-node) __dirname is src/, in prod (compiled) it's dist/
      const migrationsDir = join(__dirname, '..', 'migrations');
      const migrationFiles = ['001_create_expansions_patches.sql'];

      for (const file of migrationFiles) {
        const filePath = join(migrationsDir, file);
        try {
          const sql = readFileSync(filePath, 'utf-8');
          this.logger.log(`Running migration: ${file}`);
          await client.query(sql);
          this.logger.log(`✅ Migration ${file} completed`);
        } catch {
          this.logger.warn(`Migration file ${file} not found, skipping`);
        }
      }
    } finally {
      await client.end();
    }
  }

  private async runSeeds(): Promise<void> {
    this.logger.log('🌱 Seeding expansions...');
    await seedExpansions(this.expansionRepo);

    this.logger.log('🌱 Seeding patches...');
    await seedPatches(this.expansionRepo, this.patchRepo);

    this.logger.log('✅ Database seeding completed');
  }
}
