import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaidbotsController } from './raidbots.controller';
import { RaidbotsService } from './raidbots.service';
import { RaidbotsReport } from './raidbots-report.entity';
import { RaidbotsReportItem } from './raidbots-report-item.entity';
import { CharacterModule } from '../character/character.module';
import { ItemModule } from '../item/item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RaidbotsReport, RaidbotsReportItem]),
    CharacterModule,
    ItemModule,
  ],
  controllers: [RaidbotsController],
  providers: [RaidbotsService],
  exports: [TypeOrmModule],
})
export class RaidbotsModule {}
