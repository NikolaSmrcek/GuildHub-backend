import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { RaidbotsService } from './raidbots.service';
import { CreateRaidbotsReportDto } from './dto/create-raidbots-report.dto';

@ApiTags('Raidbots')
@Controller('raidbots')
export class RaidbotsController {
  constructor(private readonly raidbotsService: RaidbotsService) {}

  @Post('reports')
  @ApiOperation({
    summary: 'Submit a Raidbots report URL',
    description:
      'Fetches the Raidbots report data.json, validates it, matches upgrades to items in the catalog, and persists the report + upgrade items. Requires the character to exist in the database.',
  })
  @ApiBody({ type: CreateRaidbotsReportDto, description: 'Raidbots report URL to process' })
  @ApiCreatedResponse({
    description: 'The persisted report with matched upgrade items',
    schema: {
      example: {
        id: 'uuid-...',
        reportUrl: 'https://www.raidbots.com/sim/report/abc123',
        characterId: 'uuid-...',
        playerName: 'Aurelora',
        playerClass: 'Paladin',
        playerSpec: 'Retribution',
        playerDpsMean: 85000,
        isValid: true,
        reportItems: [
          {
            id: 'uuid-...',
            itemId: 'uuid-...',
            itemName: 'Endless March Waistwrap',
            playerDpsMean: 85000,
            upgradeDpsMean: 85450,
            dpsImprovement: 450,
          },
        ],
      },
    },
  })
  createReport(@Body() dto: CreateRaidbotsReportDto) {
    return this.raidbotsService.createReport(dto);
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get a Raidbots report by ID' })
  @ApiParam({ name: 'id', description: 'Report UUID', example: 'a1b2c3d4-...' })
  @ApiOkResponse({ description: 'The report with its upgrade items and character' })
  getReport(@Param('id') id: string) {
    return this.raidbotsService.getReport(id);
  }

  @Get('characters/:characterId/reports')
  @ApiOperation({
    summary: 'Get all Raidbots reports for a character',
    description: 'Returns all reports for the given character, newest first.',
  })
  @ApiParam({ name: 'characterId', description: 'Character UUID', example: 'c1-...' })
  @ApiOkResponse({ description: 'Array of reports with upgrade items' })
  getReportsByCharacter(@Param('characterId') characterId: string) {
    return this.raidbotsService.getReportsByCharacter(characterId);
  }
}
