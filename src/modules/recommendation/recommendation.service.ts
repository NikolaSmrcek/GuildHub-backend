import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../item/item.entity';
import { Guild } from '../guild/guild.entity';
import { GuildMember } from '../guild/guild-member.entity';
import { RaidbotsReportItem } from '../raidbots/raidbots-report-item.entity';
import { Character } from '../character/character.entity';
import { RecommendationSectionRegistry } from './sections/section-registry';
import { SectionInput, RecommendationResponse, CandidateResult } from './recommendation.types';
import { GuildHubLogger } from '../../shared/logger';

@Injectable()
export class RecommendationService {
  private readonly logger = new GuildHubLogger(RecommendationService.name);

  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(Guild)
    private readonly guildRepo: Repository<Guild>,
    @InjectRepository(GuildMember)
    private readonly guildMemberRepo: Repository<GuildMember>,
    @InjectRepository(RaidbotsReportItem)
    private readonly reportItemRepo: Repository<RaidbotsReportItem>,
    @InjectRepository(Character)
    private readonly characterRepo: Repository<Character>,
    private readonly sectionRegistry: RecommendationSectionRegistry,
  ) {}

  async getRecommendations(guildId: string, itemId: string): Promise<RecommendationResponse> {
    // 1. Load the item with its full hierarchy
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: {
        difficulty: {
          boss: {
            raid: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // 2. Load the guild (for loot config)
    const guild = await this.guildRepo.findOne({
      where: { id: guildId },
    });

    if (!guild) {
      throw new NotFoundException('Guild not found');
    }

    // 3. Get section weights from guild config (default all 1.0)
    const weights = this.getWeights(guild);

    // 4. Find all raid roster members with their relations
    const rosterMembers = await this.guildMemberRepo.find({
      where: { guildId, isOnRaidRoster: true },
      relations: {
        character: true,
        rank: true,
      },
    });

    if (rosterMembers.length === 0) {
      return this.emptyResponse(item, guild, weights);
    }

    // 5. Find all RaidbotsReportItems for this item linked to these characters
    //    Need: report → character → characterId
    const reportItems = await this.reportItemRepo.find({
      where: { itemId },
      relations: {
        report: true,
      },
    });

    // Build a map: characterId → raidbotsReportItem (only if dpsImprovement > 0)
    const reportItemByCharacterId = new Map<string, RaidbotsReportItem>();
    for (const ri of reportItems) {
      const charId = ri.report.characterId;
      if (ri.dpsImprovement > 0) {
        // Keep the best (highest dpsImprovement) report item per character
        const existing = reportItemByCharacterId.get(charId);
        if (!existing || ri.dpsImprovement > existing.dpsImprovement) {
          reportItemByCharacterId.set(charId, ri);
        }
      }
    }

    // 6. Filter to eligible candidates (must have a dps-improving report item for this item)
    const eligibleMembers = rosterMembers.filter((m) => reportItemByCharacterId.has(m.characterId));

    if (eligibleMembers.length === 0) {
      return this.emptyResponse(item, guild, weights);
    }

    // 7. Pre-compute max dpsImprovement across all candidates for normalization
    const maxDpsImprovement = Math.max(
      ...eligibleMembers.map((m) => reportItemByCharacterId.get(m.characterId)!.dpsImprovement),
    );

    const context: Record<string, unknown> = { maxDpsImprovement };

    // 8. Calculate scores for each candidate
    const candidates: CandidateResult[] = [];
    for (const member of eligibleMembers) {
      const character = member.character;
      const reportItem = reportItemByCharacterId.get(member.characterId)!;

      const input: SectionInput = {
        characterId: character.id,
        character,
        guildMember: member,
        item,
        guildId,
        raidbotsReportItem: reportItem,
        context,
      };

      const sectionScores: Record<string, number> = await this.sectionRegistry.calculateAll(input);

      // Compute weighted average
      let totalWeight = 0;
      let weightedSum = 0;

      for (const [sectionName, score] of Object.entries(sectionScores)) {
        const w = weights[sectionName] ?? 1.0;
        weightedSum += score * w;
        totalWeight += w;
      }

      const totalScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

      // Build section score details for response
      const sectionScoresDetail: Record<string, { score: number; weight: number }> = {};
      for (const [sectionName, score] of Object.entries(sectionScores)) {
        sectionScoresDetail[sectionName] = {
          score,
          weight: weights[sectionName] ?? 1.0,
        };
      }

      candidates.push({
        characterId: character.id,
        characterName: character.name,
        accountDisplayName: '', // TODO: join with account
        playerClass: character.playerClass,
        spec: character.spec,
        rankName: member.rank?.name ?? 'Unknown',
        totalScore,
        sectionScores: sectionScoresDetail,
      });
    }

    // 9. Sort descending by totalScore
    candidates.sort((a, b) => b.totalScore - a.totalScore);

    return {
      itemId: item.id,
      itemName: item.name,
      ilvl: item.ilvl,
      bossName: item.difficulty?.boss?.name ?? 'Unknown',
      difficulty: item.difficulty?.difficulty ?? 'Unknown',
      raidName: item.difficulty?.boss?.raid?.name ?? 'Unknown',
      weights,
      candidates,
    };
  }

  private getWeights(guild: Guild): Record<string, number> {
    const defaultWeights: Record<string, number> = {};
    const knownSectionNames = this.sectionRegistry.getNames();
    for (const name of knownSectionNames) {
      defaultWeights[name] = 1.0;
    }

    const configWeights = guild.lootConfig?.sectionWeights;
    if (!configWeights) {
      return defaultWeights;
    }

    // Merge: override defaults with guild's config where provided
    const merged: Record<string, number> = { ...defaultWeights };
    for (const [key, value] of Object.entries(configWeights)) {
      if (key in merged) {
        merged[key] = value;
      }
    }

    return merged;
  }

  private emptyResponse(
    item: Item,
    guild: Guild,
    weights: Record<string, number>,
  ): RecommendationResponse {
    return {
      itemId: item.id,
      itemName: item.name,
      ilvl: item.ilvl,
      bossName: item.difficulty?.boss?.name ?? 'Unknown',
      difficulty: item.difficulty?.difficulty ?? 'Unknown',
      raidName: item.difficulty?.boss?.raid?.name ?? 'Unknown',
      weights,
      candidates: [],
    };
  }
}
