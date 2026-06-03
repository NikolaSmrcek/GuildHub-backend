import { Injectable, Logger } from '@nestjs/common';
import { PatchRepository } from './patch.repository';
import { Patch } from './patch.entity';

@Injectable()
export class PatchService {
  private readonly logger = new Logger(PatchService.name);
  private cache: Patch[] | null = null;

  constructor(private readonly repo: PatchRepository) {}

  async getPatches(): Promise<Patch[]> {
    if (this.cache) {
      this.logger.log('Returning cached patches');
      return this.cache;
    }
    this.logger.log('Fetching patches from database');
    const patches = await this.repo.findAll();
    this.cache = patches;
    return patches;
  }

  async getPatchById(id: string): Promise<Patch | null> {
    const patches = await this.getPatches();
    return patches.find((p) => p.id === id) ?? null;
  }

  async refreshCache(): Promise<void> {
    this.cache = null;
    await this.getPatches();
  }

  /**
   * Placeholder for web search integration.
   * In production, call an external API (e.g., WoW API) to fetch current patch numbers.
   */
  async fetchPatchNumbersFromWeb(): Promise<string[]> {
    // TODO: implement actual web scraping / API call
    return ['12.0.5', '12.0.2', '11.1.0'];
  }
}
