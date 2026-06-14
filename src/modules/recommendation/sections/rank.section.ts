import { Injectable } from '@nestjs/common';
import { RecommendationSection } from './section.interface';
import { SectionInput } from '../recommendation.types';

@Injectable()
export class RankSection implements RecommendationSection {
  readonly name = 'rank';

  async calculateScore(input: SectionInput): Promise<number> {
    const rank = input.guildMember.rank;
    if (!rank) {
      return 0;
    }
    return rank.priority;
  }
}
