import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { GuildService } from './guild.service';

@ApiTags('Guild Management')
@Controller('api/guilds/:guildId')
export class GuildController {
  constructor(private readonly guildService: GuildService) {}

  // ──── Ranks ────────────────────────────────────────────────

  @Get('ranks')
  @ApiOperation({
    summary: 'List all ranks for a guild',
    description: 'Returns all rank definitions sorted by priority descending.',
  })
  @ApiParam({ name: 'guildId', description: 'Guild UUID', example: 'g1-...' })
  @ApiOkResponse({
    schema: {
      example: [
        { id: 'r1-...', name: 'Core Raider', priority: 85, defaultLoyalty: 75 },
        { id: 'r2-...', name: 'Trial', priority: 25, defaultLoyalty: 20 },
      ],
    },
  })
  async getRanks(@Param('guildId') guildId: string) {
    return this.guildService.getRanks(guildId);
  }

  @Post('ranks')
  @ApiOperation({
    summary: 'Create a new rank',
    description:
      'Creates a new rank definition for the guild. Priority and defaultLoyalty must be 0-100.',
  })
  @ApiParam({ name: 'guildId', description: 'Guild UUID', example: 'g1-...' })
  @ApiBody({ schema: { example: { name: 'Core Raider', priority: 85, defaultLoyalty: 75 } } })
  @ApiCreatedResponse({
    description: 'The created rank',
    schema: {
      example: {
        id: 'r1-...',
        guildId: 'g1-...',
        name: 'Core Raider',
        priority: 85,
        defaultLoyalty: 75,
      },
    },
  })
  async createRank(
    @Param('guildId') guildId: string,
    @Body() body: { name: string; priority: number; defaultLoyalty: number },
  ) {
    return this.guildService.createRank(guildId, body);
  }

  @Put('ranks/:rankId')
  @ApiOperation({
    summary: 'Update a rank',
    description:
      'Updates rank fields. All body fields are optional — only sent fields are updated.',
  })
  @ApiParam({ name: 'guildId', description: 'Guild UUID', example: 'g1-...' })
  @ApiParam({ name: 'rankId', description: 'Rank UUID', example: 'r1-...' })
  @ApiBody({ schema: { example: { name: 'Core Raider', priority: 90, defaultLoyalty: 80 } } })
  @ApiOkResponse({ description: 'The updated rank' })
  async updateRank(
    @Param('guildId') guildId: string,
    @Param('rankId') rankId: string,
    @Body() body: { name?: string; priority?: number; defaultLoyalty?: number },
  ) {
    return this.guildService.updateRank(guildId, rankId, body);
  }

  @Delete('ranks/:rankId')
  @ApiOperation({
    summary: 'Delete a rank',
    description:
      'Deletes a rank. Fails with 409 if any members are still assigned to this rank — reassign them first.',
  })
  @ApiParam({ name: 'guildId', description: 'Guild UUID', example: 'g1-...' })
  @ApiParam({ name: 'rankId', description: 'Rank UUID', example: 'r1-...' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  async deleteRank(@Param('guildId') guildId: string, @Param('rankId') rankId: string) {
    await this.guildService.deleteRank(guildId, rankId);
    return { success: true };
  }

  // ──── Members ──────────────────────────────────────────────

  @Get('members')
  @ApiOperation({
    summary: 'List guild members',
    description:
      'Returns all members (characters) of the guild with their rank and roster status. Filter by ?onRoster=true/false.',
  })
  @ApiParam({ name: 'guildId', description: 'Guild UUID', example: 'g1-...' })
  @ApiQuery({
    name: 'onRoster',
    required: false,
    description: 'Filter by raid roster status: "true" or "false"',
    example: 'true',
  })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: 'm1-...',
          characterId: 'c1-...',
          characterName: 'Valena',
          accountDisplayName: '',
          rankId: 'r1-...',
          rankName: 'Core Raider',
          loyaltyOverride: 80,
          isOnRaidRoster: true,
        },
      ],
    },
  })
  async getMembers(@Param('guildId') guildId: string, @Query('onRoster') onRoster?: string) {
    const rosterFilter = onRoster === 'true' ? true : onRoster === 'false' ? false : undefined;
    const members = await this.guildService.getMembers(guildId, rosterFilter);
    return members.map((m) => ({
      id: m.id,
      characterId: m.characterId,
      characterName: m.character?.name ?? 'Unknown',
      accountDisplayName: '',
      rankId: m.rankId,
      rankName: m.rank?.name ?? 'Unknown',
      loyaltyOverride: m.loyaltyOverride,
      isOnRaidRoster: m.isOnRaidRoster,
    }));
  }

  @Post('members')
  @ApiOperation({
    summary: 'Add a character to the guild',
    description:
      'Creates a guild membership record for a character. Fails with 409 if the character is already a member.',
  })
  @ApiParam({ name: 'guildId', description: 'Guild UUID', example: 'g1-...' })
  @ApiBody({
    schema: {
      example: {
        characterId: 'c1-...',
        rankId: 'r1-...',
        loyaltyOverride: null,
        isOnRaidRoster: true,
      },
    },
  })
  @ApiCreatedResponse({ description: 'The created membership record' })
  async createMember(
    @Param('guildId') guildId: string,
    @Body()
    body: {
      characterId: string;
      rankId: string;
      loyaltyOverride?: number | null;
      isOnRaidRoster?: boolean;
    },
  ) {
    return this.guildService.createMember(guildId, body);
  }

  @Put('members/:characterId')
  @ApiOperation({
    summary: 'Update a guild member',
    description:
      "Updates a member's rank, loyalty override, or roster status. All body fields optional — only sent fields are updated.",
  })
  @ApiParam({ name: 'guildId', description: 'Guild UUID', example: 'g1-...' })
  @ApiParam({ name: 'characterId', description: 'Character UUID', example: 'c1-...' })
  @ApiBody({ schema: { example: { rankId: 'r2-...', loyaltyOverride: 75, isOnRaidRoster: true } } })
  @ApiOkResponse({ description: 'The updated membership record' })
  async updateMember(
    @Param('guildId') guildId: string,
    @Param('characterId') characterId: string,
    @Body()
    body: {
      rankId?: string;
      loyaltyOverride?: number | null;
      isOnRaidRoster?: boolean;
    },
  ) {
    return this.guildService.updateMember(guildId, characterId, body);
  }

  @Delete('members/:characterId')
  @ApiOperation({
    summary: 'Remove a character from the guild',
    description: 'Deletes the guild membership record. Does NOT delete the character itself.',
  })
  @ApiParam({ name: 'guildId', description: 'Guild UUID', example: 'g1-...' })
  @ApiParam({ name: 'characterId', description: 'Character UUID', example: 'c1-...' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  async deleteMember(@Param('guildId') guildId: string, @Param('characterId') characterId: string) {
    await this.guildService.deleteMember(guildId, characterId);
    return { success: true };
  }

  // ──── Loot Config ──────────────────────────────────────────

  @Get('loot-config')
  @ApiOperation({
    summary: 'Get loot configuration',
    description:
      "Returns the guild's section weights for the recommendation engine. All weights default to 1.0.",
  })
  @ApiParam({ name: 'guildId', description: 'Guild UUID', example: 'g1-...' })
  @ApiOkResponse({
    schema: {
      example: {
        guildId: 'g1-...',
        sectionWeights: { gearUpgrade: 1.0, rank: 1.0, loyalty: 1.0, performance: 1.0 },
      },
    },
  })
  async getLootConfig(@Param('guildId') guildId: string) {
    return this.guildService.getLootConfig(guildId);
  }

  @Put('loot-config')
  @ApiOperation({
    summary: 'Update loot configuration',
    description:
      'Partially updates section weights. Only sent keys are updated; unknown keys are ignored. All weights must be >= 0.',
  })
  @ApiParam({ name: 'guildId', description: 'Guild UUID', example: 'g1-...' })
  @ApiBody({
    schema: {
      example: { sectionWeights: { gearUpgrade: 1.0, rank: 0.8, loyalty: 2.0, performance: 0.5 } },
    },
  })
  @ApiOkResponse({
    schema: {
      example: {
        guildId: 'g1-...',
        sectionWeights: { gearUpgrade: 1.0, rank: 0.8, loyalty: 2.0, performance: 0.5 },
      },
    },
  })
  async updateLootConfig(
    @Param('guildId') guildId: string,
    @Body() body: { sectionWeights: Record<string, number> },
  ) {
    return this.guildService.updateLootConfig(guildId, body);
  }
}
