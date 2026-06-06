export interface RaidbotsPlayer {
  name: string;
  race: string;
  level: number;
  role: string;
  specialization: string;
  profile_source: string;
  talents: string;
  party: number;
  ready_type: number;
  bugs: boolean;
  valid_fight_style: boolean;
  scale_player: boolean;
  potion_used: boolean;
  timeofday: string;
  zandalari_loa: string;
  vulpera_tricks: string;
  earthen_mineral: string;
  invert_scaling: number;
  reaction_offset: number;
  reaction_max: number;
  reaction_mean: number;
  reaction_stddev: number;
  reaction_nu: number;
  world_lag: number;
  world_lag_stddev: number;
  brain_lag: number;
  brain_lag_stddev: number;
  dbc: Dbc;
  potion: string;
  flask: string;
  food: string;
  augmentation?: string;
  temporary_enchant?: string;
  collected_data: {
    fight_length: object;
    waiting_time: object;
    executed_foreground_actions: object;
    dmg: DamageStatistics;
    compound_data: DamageStatistics;
    timeline_dmg: {
      mean: number;
      mean_std_dev: number;
      min: number;
      max: number;
      data: Array<number>;
    };
    total_iterations: number;
    dps: DPSStatistics;
    dpse: DamageStatistics;
    target_metric: DPSStatistics;
    buffed_stats: object;
    resource_lost: object;
    combat_end_resource: object;
    resource_timelines: object;
    action_sequence_precombat: Array<object>;
    action_sequence: Array<object>;
  };
  buffs: Array<object>;
  buffs_constant: Array<object>;
  procs: Array<object>;
  gains: Array<object>;
  stats: Array<object>;
  stats_pets: object;
  gear: Gear;
  customer: object;
}

interface DPSStatistics {
  sum: number;
  count: number;
  mean: number;
  min: number;
  max: number;
  median: number;
  variance: number;
  std_dev: number;
  mean_variance?: number; // Optional, as it may not be present in every instance
  mean_std_dev?: number; // Optional, as it may not be present in every instance
}

interface DamageStatistics {
  sum: number;
  count: number;
  mean: number;
  min: number;
  max: number;
}

interface Hotfix {
  build_level: number;
  wow_version: string;
  hotfix_date: string;
  hotfix_build: number;
  hotfix_hash: string;
}

interface Dbc {
  Live: Hotfix;
  PTR: Hotfix;
  version_used: patchVersion;
}

type patchVersion = 'Live' | 'PTR';

interface GearItem {
  name: string;
  encoded_item: string;
  ilevel: number;
  stamina?: number; // Optional, as not all items have stamina
  haste_rating?: number; // Optional, as not all items have haste rating
  mastery_rating?: number; // Optional, as not all items have mastery rating
  strint?: number; // Optional, as not all items have str/int (strength/intellect)
  crit_rating?: number; // Optional, as not all items have critical strike rating
  versatility_rating?: number; // Optional, as not all items have versatility rating
  speed_rating?: number; // Optional, as not all items have speed rating
  strength?: number; // Optional, as not all items have strength
  leech_rating?: number; // Optional, as not all items have leech rating
  stragi?: number; // Optional, as not all items have stragi
  crafted_stats?: string; // Optional, as not all items have crafted stats
}

interface Gear {
  head: GearItem;
  neck: GearItem;
  shoulders: GearItem;
  chest: GearItem;
  waist: GearItem;
  legs: GearItem;
  feet: GearItem;
  wrists: GearItem;
  hands: GearItem;
  finger1: GearItem;
  finger2: GearItem;
  trinket1: GearItem;
  trinket2: GearItem;
  back: GearItem;
  main_hand: GearItem;
}
