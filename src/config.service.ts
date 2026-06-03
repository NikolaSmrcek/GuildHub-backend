import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  // ── App ──
  get port(): number {
    return Number(process.env.PORT) || 3000;
  }

  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  // ── Database ──
  get dbHost(): string {
    return process.env.DB_HOST || 'localhost';
  }

  get dbPort(): number {
    return Number(process.env.DB_PORT) || 5432;
  }

  get dbUser(): string {
    return process.env.DB_USER || 'postgres';
  }

  get dbPassword(): string {
    return process.env.DB_PASSWORD || 'postgres';
  }

  get dbName(): string {
    return process.env.DB_NAME || 'guildhub';
  }

  get databaseUrl(): string {
    return (
      process.env.DATABASE_URL ||
      `postgresql://${this.dbUser}:${this.dbPassword}@${this.dbHost}:${this.dbPort}/${this.dbName}`
    );
  }

  // ── Migration & Seed Flags ──
  /** Set to "false" to skip running migrations on startup. Defaults to "true". */
  get runMigrations(): boolean {
    return process.env.RUN_MIGRATIONS !== 'false';
  }

  /** Set to "false" to skip running seeds on startup. Defaults to "true". */
  get runSeeds(): boolean {
    return process.env.RUN_SEEDS !== 'false';
  }

  // ── JWT ──
  get jwtSecret(): string {
    return process.env.JWT_SECRET || 'replace_with_random_secret';
  }
}
