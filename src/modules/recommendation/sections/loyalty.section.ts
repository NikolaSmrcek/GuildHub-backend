import { Injectable } from '@nestjs/common';
import { RecommendationSection } from './section.interface';
import { SectionInput } from '../recommendation.types';

@Injectable()
export class LoyaltySection implements RecommendationSection {
  readonly name = 'loyalty';

  async calculateScore(input: SectionInput): Promise<number> {
    const member = input.guildMember;

    // loyaltyOverride takes precedence; fall back to rank's defaultLoyalty
    if (member.loyaltyOverride !== null && member.loyaltyOverride !== undefined) {
      return member.loyaltyOverride;
    }

    const rank = member.rank;
    if (!rank) {
      return 50; // fallback if no rank
    }

    return rank.defaultLoyalty;
  }
}
