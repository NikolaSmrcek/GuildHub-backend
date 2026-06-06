import { Injectable } from '@nestjs/common';
import { ExpansionRepository } from './expansion.repository';
import { Expansion } from './expansion.entity';
import { GuildHubLogger } from '../../shared/logger';

@Injectable()
export class ExpansionService {
  private readonly logger = new GuildHubLogger(ExpansionService.name);
  private cache: Expansion[] | null = null;
  private latestExpansion: Expansion | null = null;

  constructor(private readonly repo: ExpansionRepository) {}

  async getExpansions(): Promise<Expansion[]> {
    if (this.cache) {
      this.logger.info('Returning cached expansions');
      return this.cache;
    }
    this.logger.info('Fetching expansions from database');
    const expansions = await this.repo.findAll();

    // sort by releaseDate descending, treat null dates as oldest
    const sorted = [...expansions].sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateB - dateA;
    });

    this.cache = sorted;
    this.latestExpansion = sorted.length > 0 ? sorted[0] : null;
    return this.cache;
  }

  async getExpansionById(id: string): Promise<Expansion | null> {
    const expansions = await this.getExpansions();
    return expansions.find((e) => e.id === id) ?? null;
  }

  async getLatestExpansion(): Promise<Expansion | null> {
    await this.getExpansions();
    return this.latestExpansion;
  }

  async refreshCache(): Promise<void> {
    this.cache = null;
    this.latestExpansion = null;
    await this.getExpansions();
  }
}
