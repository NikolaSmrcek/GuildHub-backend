import { SectionInput } from '../recommendation.types';

export interface RecommendationSection {
  readonly name: string;
  calculateScore(input: SectionInput): Promise<number>;
}
