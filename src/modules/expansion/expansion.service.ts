import { Injectable, Logger } from '@nestjs/common';
import { ExpansionRepository } from './expansion.repository';
import { Expansion } from './expansion.entity';

@Injectable()
export class ExpansionService {
  private readonly logger = new Logger(ExpansionService.name);
  private cache: Expansion[] | null = null;

  constructor(private readonly repo: ExpansionRepository) {}

  async getExpansions(): Promise<Expansion[]> {
    if (this.cache) {
      this.logger.log('Returning cached expansions');
      return this.cache;
    }
    this.logger.log('Fetching expansions from database');
    const expansions = await this.repo.findAll();
    this.cache = expansions;
    return expansions;
  }

  async getExpansionById(id: string): Promise<Expansion | null> {
    const expansions = await this.getExpansions();
    return expansions.find((e) => e.id === id) ?? null;
  }

  async refreshCache(): Promise<void> {
    this.cache = null;
    await this.getExpansions();
  }

  /**
   * Placeholder for web search integration.
   * In production, call an external API (e.g., WoW API) to fetch current expansion names.
   */
  async fetchExpansionNamesFromWeb(): Promise<string[]> {
    // TODO: implement actual web scraping / API call
    return ['The War Within', 'Dragonflight', 'Shadowlands'];
  }
}
