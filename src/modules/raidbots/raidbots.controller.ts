import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { RaidbotsService } from './raidbots.service';
import { CreateRaidbotsReportDto } from './dto/create-raidbots-report.dto';

@Controller('raidbots')
export class RaidbotsController {
  constructor(private readonly raidbotsService: RaidbotsService) {}

  /**
   * POST /raidbots/reports
   * Accept a Raidbots report URL, fetch & analyze it, persist upgrades.
   */
  @Post('reports')
  createReport(@Body() dto: CreateRaidbotsReportDto) {
    return this.raidbotsService.createReport(dto);
  }

  /**
   * GET /raidbots/reports/:id
   * Get a single report by ID.
   */
  @Get('reports/:id')
  getReport(@Param('id') id: string) {
    return this.raidbotsService.getReport(id);
  }

  /**
   * GET /raidbots/characters/:characterId/reports
   * Get all reports for a character.
   */
  @Get('characters/:characterId/reports')
  getReportsByCharacter(@Param('characterId') characterId: string) {
    return this.raidbotsService.getReportsByCharacter(characterId);
  }
}
