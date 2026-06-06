export interface DropOptimizerRaidbotsProfileSets {
  metric: string;
  results: Array<DropOptimizerResultsItem>;
}

interface OverrideStats {
  stamina: number;
  agility: number;
  intellect: number;
  strength: number;
  crit_rating: number;
  crit_pct: number;
  haste_rating: number;
  haste_pct: number;
  mastery_rating: number;
  mastery_pct: number;
  versatility_rating: number;
  versatility_pct: number;
  avoidance_rating: number;
  avoidance_pct: number;
  leech_rating: number;
  leech_pct: number;
  speed_rating: number;
  speed_pct: number;
  corruption: number;
  corruption_resistance: number;
}

interface Overrides {
  stats: OverrideStats;
}

interface Simbot {
  stage: number;
  targetError: number;
}

export interface DropOptimizerResultsItem {
  name: string;
  mean: number;
  min: number;
  max: number;
  stddev: number;
  mean_stddev: number;
  mean_error: number;
  median: number;
  first_quartile: number;
  third_quartile: number;
  iterations: number;
  overrides: Overrides;
  simbot: Simbot;
}
