interface Stat {
  id: number;
  alloc: number;
}

interface Source {
  instanceId: number;
  encounterId: number;
}

interface TooltipParams {
  enchant: number;
}

export interface DropOptimizerItem {
  id: string;
  slot: string;
  item: {
    id: number;
    name: string;
    icon: string;
    quality: number;
    itemClass: number;
    itemSubClass: number;
    inventoryType: number;
    itemLevel: number;
    stats: Stat[];
    sources: Source[];
    expansion: number;
    baseItemLevel: number;
    enchant_id: number;
    tooltipParams: TooltipParams;
    dropLevel: number;
    bonus_id: string;
    bonusLists: number[];
    gem_id: string;
    instanceId: number;
    encounterId: number;
    difficulty: string;
    instance: Instance;
    encounter: Encounter;
    overrides: Overrides;
    offSpecItem: boolean;
    upgrade: Upgrade;
    socketInfo: any;
  };
}

interface Encounter {
  id: number;
  name: string;
  icon: string;
  order: number;
  flags: number;
  difficulty_mask: number;
}

interface Instance {
  id: number;
  name: string;
  description: string;
  image_button: string;
  image_button_small: string;
  image_background: string;
  flags: number;
  type_id: number;
  type: string;
  encounters: Encounter[];
}

interface Overrides {
  encounterId: number;
  encounterSequenceOffset: number;
  instanceId: number;
  difficulty: string;
  itemLevel: string;
  levelSelectorSequence: number;
  season: string;
  levelSelectorSetUpgradeTrack: boolean;
  seasonId: number;
  disableWarforgeLevel: boolean;
  enableSockets: boolean;
  itemConversion: {
    id: number;
    minLevel: number;
  };
  instance: Instance;
  encounter: Encounter;
  encounterType: string;
  encounterTypePlural: string;
  quality: number;
}

interface UpgradeCostAmount {
  currencyId: number;
  amount: number;
  name: string;
  icon: string;
}

interface UpgradeCostMaskInvType {
  mask_inv_type: number;
  flags: number;
  amounts: UpgradeCostAmount[];
}

interface UpgradeHighWatermarkDiscount {
  type: string;
  id: number;
  scaling: number;
  accountWide: boolean;
}

interface Upgrade {
  group: number;
  level: number;
  max: number;
  name: string;
  fullName: string;
  bonusId: number;
  itemLevel: number;
  seasonId: number;
  costs: UpgradeCostMaskInvType[];
  currency: UpgradeCostAmount;
  highWatermarkDiscounts: UpgradeHighWatermarkDiscount[];
}
