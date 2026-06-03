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

  async getLatestExpansion(): Promise<Expansion | null> {
    const expansions = await this.getExpansions();
    if (expansions.length === 0) {
      return null;
    }
    // sort by releaseDate descending, treat null dates as oldest
    const sorted = [...expansions].sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateB - dateA;
    });
    return sorted[0];
  }

  async refreshCache(): Promise<void> {
    this.cache = null;
    await this.getExpansions();
  }
}
