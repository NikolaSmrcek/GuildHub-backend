import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaidbotsReport } from './raidbots-report.entity';
import { RaidbotsReportItem } from './raidbots-report-item.entity';
import { Character } from '../character/character.entity';
import { Item } from '../item/item.entity';
import { CreateRaidbotsReportDto } from './dto/create-raidbots-report.dto';
import { RaidbotsDataJson } from './interfaces/raidbots-data.interface';
import { validateRaidbotsResponse } from './raidbots-response-validator';
import { GuildHubLogger } from '../../shared/logger';

@Injectable()
export class RaidbotsService {
  private readonly logger = new GuildHubLogger(RaidbotsService.name);

  constructor(
    @InjectRepository(RaidbotsReport)
    private readonly reportRepo: Repository<RaidbotsReport>,
    @InjectRepository(RaidbotsReportItem)
    private readonly reportItemRepo: Repository<RaidbotsReportItem>,
    @InjectRepository(Character)
    private readonly characterRepo: Repository<Character>,
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {}

  /**
   * Accept a Raidbots report URL, fetch & analyze the data,
   * then persist the report and any identified upgrades.
   */
  async createReport(dto: CreateRaidbotsReportDto): Promise<RaidbotsReport> {
    const rawUrl = dto.raidbotsReportUrl.trim();

    // Validate URL format
    let reportUrl: string;
    try {
      const parsed = new URL(rawUrl);
      // Accept raidbots.com URLs
      if (!parsed.hostname.includes('raidbots.com')) {
        throw new Error('Not a raidbots.com URL');
      }
      // Normalise to the report page URL (strip /data.json if already present)
      reportUrl = rawUrl.replace(/\/data\.json$/, '');
    } catch {
      throw new BadRequestException(
        'Invalid Raidbots report URL. Must be a valid raidbots.com URL.',
      );
    }

    // Fetch the data.json
    const dataJsonUrl = reportUrl + '/data.json';
    let data: RaidbotsDataJson;
    try {
      const res = await fetch(dataJsonUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      data = (await res.json()) as RaidbotsDataJson;
    } catch (err) {
      throw new BadRequestException(
        `Failed to fetch report data from ${dataJsonUrl}: ${(err as Error).message}`,
      );
    }

    // Validate all critical data points exist in the response
    const validated = validateRaidbotsResponse(data);
    const { player, playerDpsMean, profileSets, droptimizerItems } = validated;

    // Try to find a matching character by name (case-insensitive)
    const character = await this.characterRepo.findOne({
      where: { name: player.name, isDeleted: false },
    });

    if (!character) {
      throw new NotFoundException(
        `Character "${player.name}" not found in the database. Create the character first before submitting a report.`,
      );
    }

    // Determine upgrades: profileset entries with mean > playerDpsMean
    const upgrades: Array<{
      profilesetId: string;
      profilesetMean: number;
      droptimizerName: string;
      matchedItem: Item;
    }> = [];

    for (const ps of profileSets) {
      if (ps.mean > playerDpsMean) {
        // Find the matching droptimizer item by id
        const droptimizerItem = droptimizerItems.find((di) => String(di.id) === String(ps.id));
        if (!droptimizerItem) {
          this.logger.debug('No droptimizer item found.', {
            ...ps,
          });
          continue; // no matching droptimizer item found
        }

        const droptimizerItemDiff = droptimizerItem.name;

        // Match our DB item by normalized name (direct query, no full table fetch)
        const matchedItem = await this.itemRepo.findOne({
          where: { normalizedName: droptimizerItem.name.toLowerCase() },
        });
        if (!matchedItem) {
          this.logger.debug('No matching item found.', {
            ...droptimizerItem,
          });
          continue; // item not in our database
        }

        upgrades.push({
          profilesetId: ps.id,
          profilesetMean: ps.mean,
          droptimizerName: droptimizerItem.name,
          matchedItem,
        });
      }
    }

    // Persist the report
    const report = this.reportRepo.create({
      reportUrl,
      characterId: character.id,
      playerName: player.name,
      playerClass: player.class ?? null,
      playerSpec: player.spec ?? null,
      playerDpsMean,
      rawData: data as unknown as object,
    });

    const savedReport = await this.reportRepo.save(report);

    // Persist report items for each upgrade
    if (upgrades.length > 0) {
      const reportItems = upgrades.map((u) =>
        this.reportItemRepo.create({
          reportId: savedReport.id,
          itemId: u.matchedItem.id,
          itemName: u.droptimizerName,
          playerDpsMean,
          upgradeDpsMean: u.profilesetMean,
          dpsImprovement: u.profilesetMean - playerDpsMean,
        }),
      );
      await this.reportItemRepo.save(reportItems);
    }

    // Return the report with its items
    return this.reportRepo.findOne({
      where: { id: savedReport.id },
      relations: {
        reportItems: true,
        character: true,
      },
    }) as Promise<RaidbotsReport>;
  }

  /** Get a single report by ID */
  async getReport(id: string): Promise<RaidbotsReport> {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: {
        reportItems: true,
        character: true,
      },
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  /** Get all reports for a character */
  async getReportsByCharacter(characterId: string): Promise<RaidbotsReport[]> {
    return this.reportRepo.find({
      where: { characterId },
      relations: { reportItems: true },
      order: { createdAt: 'DESC' },
    });
  }
}
