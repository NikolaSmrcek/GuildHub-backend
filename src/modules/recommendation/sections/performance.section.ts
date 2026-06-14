import { Injectable } from '@nestjs/common';
import { RecommendationSection } from './section.interface';
import { SectionInput } from '../recommendation.types';

@Injectable()
export class PerformanceSection implements RecommendationSection {
  readonly name = 'performance';

  async calculateScore(_input: SectionInput): Promise<number> {
    // MOCK: returns 50 for all characters.
    // TODO: Integrate with WarcraftLogs API to get actual per-boss percentiles.
    // Integration plan:
    //   1. Fetch WarcraftLogs parses for the character on the relevant boss/difficulty
    //   2. Average the percentiles across pulls
    //   3. Return 0-100 value
    return 50;
  }
}
