import { Character } from '../character/character.entity';
import { Item } from '../item/item.entity';
import { GuildMember } from '../guild/guild-member.entity';
import { RaidbotsReportItem } from '../raidbots/raidbots-report-item.entity';

export interface SectionInput {
  characterId: string;
  character: Character;
  guildMember: GuildMember;
  item: Item;
  guildId: string;
  raidbotsReportItem: RaidbotsReportItem | null;
  /** Bag of pre-computed aggregations across all candidates for this request */
  context: Record<string, unknown>;
}

export interface SectionScore {
  score: number;
  weight: number;
}

export interface CandidateResult {
  characterId: string;
  characterName: string;
  accountDisplayName: string;
  playerClass: string | null;
  spec: string | null;
  rankName: string;
  totalScore: number;
  sectionScores: Record<string, SectionScore>;
}

export interface RecommendationResponse {
  itemId: string;
  itemName: string;
  ilvl: number | null;
  bossName: string;
  difficulty: string;
  raidName: string;
  weights: Record<string, number>;
  candidates: CandidateResult[];
}

export interface LootConfigResponse {
  guildId: string;
  sectionWeights: Record<string, number>;
}
