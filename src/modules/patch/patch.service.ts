import { Injectable, Logger } from '@nestjs/common';
import { PatchRepository } from './patch.repository';
import { Patch } from './patch.entity';

@Injectable()
export class PatchService {
  private readonly logger = new Logger(PatchService.name);
  private cache: Patch[] | null = null;
  /** Cached patches grouped by expansionId, sorted by releaseDate descending. */
  private patchesByExpansion: Map<string, Patch[]> = new Map();
  /** Cached latest patch per expansionId. */
  private latestPatchByExpansion: Map<string, Patch | null> = new Map();

  constructor(private readonly repo: PatchRepository) {}

  async getPatches(): Promise<Patch[]> {
    if (this.cache) {
      this.logger.log('Returning cached patches');
      return this.cache;
    }
    this.logger.log('Fetching patches from database');
    const patches = await this.repo.findAll();

    // Sort all patches by releaseDate descending, treat null dates as oldest
    const sorted = [...patches].sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateB - dateA;
    });

    this.cache = sorted;

    // Group by expansionId and compute latest per expansion
    const byExpansion = new Map<string, Patch[]>();
    const latestByExpansion = new Map<string, Patch | null>();

    for (const patch of sorted) {
      const list = byExpansion.get(patch.expansionId);
      if (list) {
        list.push(patch);
      } else {
        byExpansion.set(patch.expansionId, [patch]);
        // First occurrence = latest (already sorted descending by date)
        latestByExpansion.set(patch.expansionId, patch);
      }
    }

    // Ensure expansions with no patches get null
    this.patchesByExpansion = byExpansion;
    this.latestPatchByExpansion = latestByExpansion;

    return this.cache;
  }

  async getPatchById(id: string): Promise<Patch | null> {
    const patches = await this.getPatches();
    return patches.find((p) => p.id === id) ?? null;
  }

  async getPatchesByExpansionId(expansionId: string): Promise<Patch[]> {
    await this.getPatches();
    return this.patchesByExpansion.get(expansionId) ?? [];
  }

  async getLatestPatchByExpansionId(expansionId: string): Promise<Patch | null> {
    await this.getPatches();
    return this.latestPatchByExpansion.get(expansionId) ?? null;
  }

  async refreshCache(): Promise<void> {
    this.cache = null;
    this.patchesByExpansion = new Map();
    this.latestPatchByExpansion = new Map();
    await this.getPatches();
  }
}
