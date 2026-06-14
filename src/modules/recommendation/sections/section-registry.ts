import { Injectable, Inject } from '@nestjs/common';
import { RECOMMENDATION_SECTION } from './section.token';
import { RecommendationSection } from './section.interface';
import { SectionInput } from '../recommendation.types';

@Injectable()
export class RecommendationSectionRegistry {
  constructor(
    @Inject(RECOMMENDATION_SECTION)
    private readonly sections: RecommendationSection[],
  ) {}

  getAll(): RecommendationSection[] {
    return this.sections;
  }

  getNames(): string[] {
    return this.sections.map((s) => s.name);
  }

  async calculateAll(input: SectionInput): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    for (const section of this.sections) {
      results[section.name] = await section.calculateScore(input);
    }
    return results;
  }
}
