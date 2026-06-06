import { DifficultyName } from '../../modules/difficulty/difficulty.entity';

export interface ItemSeed {
  name: string;
  normalizedName: string;
  ilvl: number;
  slot?: string;
  class?: string;
  subclass?: string;
}

export interface DifficultySeed {
  difficulty: DifficultyName;
  items: ItemSeed[];
}

export interface BossSeed {
  name: string;
  order: number;
  difficulties: DifficultySeed[];
}

export interface RaidSeed {
  name: string;
  order: number;
  expansionShortName: string;
  patchNumbers: string[];
  bosses: BossSeed[];
}
