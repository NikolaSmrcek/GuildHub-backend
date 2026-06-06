import { DifficultyName } from '../../../modules/difficulty/difficulty.entity';
import { RaidSeed } from '../types';

const lfr = DifficultyName.LFR;
const normal = DifficultyName.NORMAL;
const heroic = DifficultyName.HEROIC;
const mythic = DifficultyName.MYTHIC;

// Dreamrift item levels (higher than Voidspire — later content)
const LFR_ILVL = 237;
const NORMAL_ILVL = 250;
const HEROIC_ILVL = 263;
const MYTHIC_ILVL = 276;

function diffEntries(items: { name: string; slot: string; class: string; subclass: string }[]) {
  const itemsWithNorm = items.map((i) => ({ ...i, normalizedName: i.name.toLowerCase() }));
  const map = (ilvl: number) => itemsWithNorm.map((i) => ({ ...i, ilvl }));
  return [
    { difficulty: lfr, items: map(LFR_ILVL) },
    { difficulty: normal, items: map(NORMAL_ILVL) },
    { difficulty: heroic, items: map(HEROIC_ILVL) },
    { difficulty: mythic, items: map(MYTHIC_ILVL) },
  ];
}

/**
 * Dreamrift — single-boss raid. Drops chest tier tokens.
 * Item levels: LFR 237, Normal 250, Heroic 263, Mythic 276.
 */
export const dreamriftSeed: RaidSeed = {
  name: 'Dreamrift',
  order: 2,
  expansionShortName: 'MIDNIGHT',
  patchNumbers: ['12.0.0', '12.0.2', '12.0.5'],
  bosses: [
    {
      name: 'Chimaerus',
      order: 1,
      difficulties: diffEntries([
        { name: "Clutchmates' Caress", slot: 'One-Hand', class: 'Weapon', subclass: 'Mace' },
        { name: 'Alnscorned Spire', slot: 'Two-Hand', class: 'Weapon', subclass: 'Staff' },
        { name: 'Gaze of the Alnseer', slot: 'Trinket', class: 'Armor', subclass: 'Trinket' },
        {
          name: "Undreamt God's Oozing Vestige",
          slot: 'Trinket',
          class: 'Armor',
          subclass: 'Trinket',
        },
        {
          name: 'Tome of Alnscorned Regret',
          slot: 'Off-Hand',
          class: 'Armor',
          subclass: 'Off-hand',
        },
        { name: 'Scornbane Waistguard', slot: 'Waist', class: 'Armor', subclass: 'Mail' },
        { name: 'Dream-Scorched Striders', slot: 'Feet', class: 'Armor', subclass: 'Cloth' },
        {
          name: "Scorn-Scarred Shul'ka's Belt",
          slot: 'Waist',
          class: 'Armor',
          subclass: 'Leather',
        },
        { name: 'Greaves of the Unformed', slot: 'Feet', class: 'Armor', subclass: 'Plate' },
        // Chest tier token
        {
          name: 'Dream-Vestured Chestguard',
          slot: 'Chest',
          class: 'Armor',
          subclass: 'Tier Token',
        },
      ]),
    },
  ],
};
