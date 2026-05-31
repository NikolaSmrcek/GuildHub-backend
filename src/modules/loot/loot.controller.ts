import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LootService } from './loot.service';

@Controller('loot')
export class LootController {
  constructor(private readonly lootService: LootService) {}

  @Get('ping')
  ping() {
    return { pong: true };
  }

  @Post('items')
  createItem(@Body() body: any) {
    return this.lootService.createItem(body);
  }

  @Get('items/:id')
  getItem(@Param('id') id: string) {
    return this.lootService.getItem(id);
  }
}
