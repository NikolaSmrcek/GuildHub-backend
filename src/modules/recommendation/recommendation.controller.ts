import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiOkResponse } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';

@ApiTags('Recommendations')
@Controller('api/guilds/:guildId/recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('items/:itemId')
  @ApiOperation({
    summary: 'Get loot recommendations for an item',
    description:
      'Returns eligible raid-roster characters ranked by recommendation score (0-100). Eligibility: character must be on the guild raid roster AND have a Raidbots report showing DPS improvement for this item. Score is a weighted average of gearUpgrade, rank, loyalty, and performance sections. Weights are configurable per guild via /api/guilds/:guildId/loot-config.',
  })
  @ApiParam({ name: 'guildId', description: 'Guild UUID', example: 'g1-...' })
  @ApiParam({ name: 'itemId', description: 'Item UUID', example: 'a1b2c3d4-...' })
  @ApiOkResponse({
    description: 'Ranked list of candidates with section breakdowns',
    schema: {
      example: {
        itemId: 'a1b2c3d4-...',
        itemName: 'Endless March Waistwrap',
        ilvl: 519,
        bossName: 'Imperator Averzian',
        difficulty: 'Mythic',
        raidName: 'Voidspire',
        weights: { gearUpgrade: 1.0, rank: 1.0, loyalty: 1.0, performance: 1.0 },
        candidates: [
          {
            characterId: 'c1-...',
            characterName: 'Valena',
            accountDisplayName: '',
            playerClass: 'Priest',
            spec: 'Holy',
            rankName: 'Core Raider',
            totalScore: 78.8,
            sectionScores: {
              gearUpgrade: { score: 100, weight: 1.0 },
              rank: { score: 85, weight: 1.0 },
              loyalty: { score: 80, weight: 1.0 },
              performance: { score: 50, weight: 1.0 },
            },
          },
        ],
      },
    },
  })
  async getRecommendations(@Param('guildId') guildId: string, @Param('itemId') itemId: string) {
    return this.recommendationService.getRecommendations(guildId, itemId);
  }
}
