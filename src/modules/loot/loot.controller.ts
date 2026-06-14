import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { LootService } from './loot.service';

@ApiTags('Loot (Legacy)')
@Controller('loot')
export class LootController {
  constructor(private readonly lootService: LootService) {}

  @Get('ping')
  @ApiOperation({
    summary: 'Ping the loot module',
    description: 'Simple connectivity check for the loot module.',
  })
  @ApiOkResponse({ schema: { example: { pong: true } } })
  ping() {
    return { pong: true };
  }

  @Get('raid-items')
  @ApiOperation({
    summary: 'Get raid item catalog',
    description:
      'Returns a hardcoded catalog of raid items with player priorities. Used for development/testing.',
  })
  @ApiOkResponse({ description: 'Nested raid → boss → difficulty → items catalog' })
  getRaidItems() {
    return this.lootService.getRaidItemCatalog();
  }

  @Post('items')
  @ApiOperation({
    summary: 'Create a loot item (in-memory)',
    description:
      'Creates an in-memory item entry. Data is not persisted — for development use only.',
  })
  @ApiBody({ schema: { example: { id: 'item-42', name: 'Test Item', ilvl: 500 } } })
  @ApiCreatedResponse({
    description: 'The created item',
    schema: { example: { id: 'item-42', name: 'Test Item', ilvl: 500 } },
  })
  createItem(@Body() body: Record<string, unknown>) {
    return this.lootService.createItem(body);
  }

  @Get('items/:id')
  @ApiOperation({
    summary: 'Get a loot item by ID (in-memory)',
    description: 'Retrieves an in-memory item by ID. Returns null if not found.',
  })
  @ApiParam({ name: 'id', description: 'Item UUID or custom ID', example: 'item-1' })
  @ApiOkResponse({
    description: 'Item object or null',
    schema: { example: { id: 'item-1', name: 'Sanguine Crossblade', ilvl: 449 } },
  })
  getItem(@Param('id') id: string) {
    return this.lootService.getItem(id);
  }
}
