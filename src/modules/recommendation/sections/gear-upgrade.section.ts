import { Injectable } from '@nestjs/common';
import { RecommendationSection } from './section.interface';
import { SectionInput } from '../recommendation.types';

@Injectable()
export class GearUpgradeSection implements RecommendationSection {
  readonly name = 'gearUpgrade';

  async calculateScore(input: SectionInput): Promise<number> {
    const reportItem = input.raidbotsReportItem;
    if (!reportItem) {
      return 0;
    }

    const dpsImprovement = reportItem.dpsImprovement;
    if (dpsImprovement <= 0) {
      return 0;
    }

    const maxDpsImprovement = input.context.maxDpsImprovement as number | undefined;
    if (!maxDpsImprovement || maxDpsImprovement <= 0) {
      return 100;
    }

    return Math.round((dpsImprovement / maxDpsImprovement) * 100);
  }
}
