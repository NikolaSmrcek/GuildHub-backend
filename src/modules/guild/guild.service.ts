import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Guild } from './guild.entity';
import { GuildRank } from './guild-rank.entity';
import { GuildMember } from './guild-member.entity';
import { LootConfigResponse } from '../recommendation/recommendation.types';

@Injectable()
export class GuildService {
  constructor(
    @InjectRepository(Guild)
    private readonly guildRepo: Repository<Guild>,
    @InjectRepository(GuildRank)
    private readonly rankRepo: Repository<GuildRank>,
    @InjectRepository(GuildMember)
    private readonly memberRepo: Repository<GuildMember>,
  ) {}

  // ──── Ranks ────────────────────────────────────────────────

  async getRanks(guildId: string): Promise<GuildRank[]> {
    return this.rankRepo.find({
      where: { guildId },
      order: { priority: 'DESC' },
    });
  }

  async createRank(
    guildId: string,
    data: { name: string; priority: number; defaultLoyalty: number },
  ): Promise<GuildRank> {
    this.validateRankData(data);
    await this.ensureGuildExists(guildId);

    const rank = this.rankRepo.create({
      guildId,
      name: data.name,
      priority: data.priority,
      defaultLoyalty: data.defaultLoyalty,
    });
    return this.rankRepo.save(rank);
  }

  async updateRank(
    guildId: string,
    rankId: string,
    data: { name?: string; priority?: number; defaultLoyalty?: number },
  ): Promise<GuildRank> {
    const rank = await this.rankRepo.findOne({
      where: { id: rankId, guildId },
    });
    if (!rank) {
      throw new NotFoundException('Rank not found');
    }

    if (data.name !== undefined) rank.name = data.name;
    if (data.priority !== undefined) rank.priority = data.priority;
    if (data.defaultLoyalty !== undefined) rank.defaultLoyalty = data.defaultLoyalty;

    this.validateRankData(rank);
    return this.rankRepo.save(rank);
  }

  async deleteRank(guildId: string, rankId: string): Promise<void> {
    const rank = await this.rankRepo.findOne({
      where: { id: rankId, guildId },
      relations: { members: true },
    });
    if (!rank) {
      throw new NotFoundException('Rank not found');
    }
    if (rank.members && rank.members.length > 0) {
      throw new ConflictException(
        'Cannot delete rank that still has members assigned. Reassign members first.',
      );
    }
    await this.rankRepo.remove(rank);
  }

  // ──── Members ──────────────────────────────────────────────

  async getMembers(guildId: string, onRoster?: boolean): Promise<GuildMember[]> {
    const where: FindOptionsWhere<GuildMember> = { guildId };
    if (onRoster !== undefined) {
      where.isOnRaidRoster = onRoster;
    }
    return this.memberRepo.find({
      where,
      relations: {
        character: true,
        rank: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async createMember(
    guildId: string,
    data: {
      characterId: string;
      rankId: string;
      loyaltyOverride?: number | null;
      isOnRaidRoster?: boolean;
    },
  ): Promise<GuildMember> {
    await this.ensureGuildExists(guildId);
    await this.ensureRankExists(guildId, data.rankId);

    if (data.loyaltyOverride !== null && data.loyaltyOverride !== undefined) {
      this.validateLoyalty(data.loyaltyOverride);
    }

    // Check duplicate
    const existing = await this.memberRepo.findOne({
      where: { guildId, characterId: data.characterId },
    });
    if (existing) {
      throw new ConflictException('Character is already a member of this guild');
    }

    const member = this.memberRepo.create({
      guildId,
      characterId: data.characterId,
      rankId: data.rankId,
      loyaltyOverride: data.loyaltyOverride ?? null,
      isOnRaidRoster: data.isOnRaidRoster ?? false,
    });
    return this.memberRepo.save(member);
  }

  async updateMember(
    guildId: string,
    characterId: string,
    data: {
      rankId?: string;
      loyaltyOverride?: number | null;
      isOnRaidRoster?: boolean;
    },
  ): Promise<GuildMember> {
    const member = await this.memberRepo.findOne({
      where: { guildId, characterId },
      relations: { character: true, rank: true },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (data.rankId !== undefined) {
      await this.ensureRankExists(guildId, data.rankId);
      member.rankId = data.rankId;
    }
    if (data.loyaltyOverride !== undefined) {
      if (data.loyaltyOverride !== null) {
        this.validateLoyalty(data.loyaltyOverride);
      }
      member.loyaltyOverride = data.loyaltyOverride;
    }
    if (data.isOnRaidRoster !== undefined) {
      member.isOnRaidRoster = data.isOnRaidRoster;
    }

    return this.memberRepo.save(member);
  }

  async deleteMember(guildId: string, characterId: string): Promise<void> {
    const member = await this.memberRepo.findOne({
      where: { guildId, characterId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    await this.memberRepo.remove(member);
  }

  // ──── Loot Config ──────────────────────────────────────────

  async getLootConfig(guildId: string): Promise<LootConfigResponse> {
    const guild = await this.ensureGuildExists(guildId);
    return {
      guildId: guild.id,
      sectionWeights: guild.lootConfig?.sectionWeights ?? {},
    };
  }

  async updateLootConfig(
    guildId: string,
    data: { sectionWeights: Record<string, number> },
  ): Promise<LootConfigResponse> {
    const guild = await this.ensureGuildExists(guildId);

    // Validate weights: all must be >= 0
    for (const [key, value] of Object.entries(data.sectionWeights)) {
      if (typeof value !== 'number' || value < 0) {
        throw new BadRequestException(`Invalid weight for "${key}": must be a non-negative number`);
      }
    }

    // Merge with existing config (partial update)
    const existing = guild.lootConfig?.sectionWeights ?? {};
    const merged: Record<string, number> = { ...existing, ...data.sectionWeights };

    guild.lootConfig = { sectionWeights: merged };
    await this.guildRepo.save(guild);

    return {
      guildId: guild.id,
      sectionWeights: merged,
    };
  }

  // ──── Helpers ──────────────────────────────────────────────

  private async ensureGuildExists(guildId: string): Promise<Guild> {
    const guild = await this.guildRepo.findOne({ where: { id: guildId } });
    if (!guild) {
      throw new NotFoundException('Guild not found');
    }
    return guild;
  }

  private async ensureRankExists(guildId: string, rankId: string): Promise<void> {
    const rank = await this.rankRepo.findOne({ where: { id: rankId, guildId } });
    if (!rank) {
      throw new NotFoundException('Rank not found in this guild');
    }
  }

  private validateRankData(data: { name?: string; priority?: number; defaultLoyalty?: number }) {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new BadRequestException('Rank name cannot be empty');
    }
    if (data.priority !== undefined && (data.priority < 0 || data.priority > 100)) {
      throw new BadRequestException('Priority must be between 0 and 100');
    }
    if (
      data.defaultLoyalty !== undefined &&
      (data.defaultLoyalty < 0 || data.defaultLoyalty > 100)
    ) {
      throw new BadRequestException('Default loyalty must be between 0 and 100');
    }
  }

  private validateLoyalty(value: number) {
    if (value < 0 || value > 100) {
      throw new BadRequestException('Loyalty override must be between 0 and 100');
    }
  }
}
