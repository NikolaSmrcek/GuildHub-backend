import { Module } from '@nestjs/common';
import { LootController } from './loot.controller';
import { LootService } from './loot.service';

@Module({
  controllers: [LootController],
  providers: [LootService]
})
export class LootModule {}
