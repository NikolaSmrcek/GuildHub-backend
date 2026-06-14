import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { RecommendationSectionRegistry } from './sections/section-registry';
import { RECOMMENDATION_SECTION } from './sections/section.token';
import { GearUpgradeSection } from './sections/gear-upgrade.section';
import { RankSection } from './sections/rank.section';
import { LoyaltySection } from './sections/loyalty.section';
import { PerformanceSection } from './sections/performance.section';
import { Item } from '../item/item.entity';
import { Guild } from '../guild/guild.entity';
import { GuildMember } from '../guild/guild-member.entity';
import { GuildRank } from '../guild/guild-rank.entity';
import { RaidbotsReportItem } from '../raidbots/raidbots-report-item.entity';
import { Character } from '../character/character.entity';

const sectionProviders = [GearUpgradeSection, RankSection, LoyaltySection, PerformanceSection];

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, Guild, GuildMember, GuildRank, RaidbotsReportItem, Character]),
  ],
  controllers: [RecommendationController],
  providers: [
    ...sectionProviders,
    {
      provide: RECOMMENDATION_SECTION,
      useFactory: (
        gearUpgrade: GearUpgradeSection,
        rank: RankSection,
        loyalty: LoyaltySection,
        performance: PerformanceSection,
      ) => [gearUpgrade, rank, loyalty, performance],
      inject: [GearUpgradeSection, RankSection, LoyaltySection, PerformanceSection],
    },
    RecommendationSectionRegistry,
    RecommendationService,
  ],
})
export class RecommendationModule {}
