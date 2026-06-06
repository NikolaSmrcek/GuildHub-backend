import { DifficultyName } from '../../../modules/difficulty/difficulty.entity';
import { RaidSeed } from '../types';

const lfr = DifficultyName.LFR;
const normal = DifficultyName.NORMAL;
const heroic = DifficultyName.HEROIC;
const mythic = DifficultyName.MYTHIC;

// March on Quel'Danas item levels (same as Dreamrift)
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
 * March on Quel'Danas — 2-boss raid. Drops Curio tier tokens (any armor slot).
 * Ashes of Belo'ren mount drops from Midnight Falls on Mythic.
 * Item levels: LFR 237, Normal 250, Heroic 263, Mythic 276.
 */
export const marchOnQueldanasSeed: RaidSeed = {
  name: "March on Quel'Danas",
  order: 3,
  expansionShortName: 'MIDNIGHT',
  patchNumbers: ['12.0.0', '12.0.2', '12.0.5'],
  bosses: [
    {
      name: "Belo'ren",
      order: 1,
      difficulties: diffEntries([
        { name: 'Sunbound Breastplate', slot: 'Chest', class: 'Armor', subclass: 'Plate' },
        {
          name: "Belo'melorn, the Shattered Talon",
          slot: 'One-Hand',
          class: 'Weapon',
          subclass: 'Dagger',
        },
        { name: "Belo'ren's Swift Talon", slot: 'One-Hand', class: 'Weapon', subclass: 'Dagger' },
        {
          name: 'Brazier of the Dissonant Dirge',
          slot: 'Two-Hand',
          class: 'Weapon',
          subclass: 'Staff',
        },
        { name: "Alah'endal, the Dawnsong", slot: 'Two-Hand', class: 'Weapon', subclass: 'Axe' },
        { name: 'Emberborn Grasps', slot: 'Hands', class: 'Armor', subclass: 'Plate' },
        {
          name: "Radiant Clutchtender's Jerkin",
          slot: 'Chest',
          class: 'Armor',
          subclass: 'Leather',
        },
        { name: 'Eternal Flame Scaleguards', slot: 'Legs', class: 'Armor', subclass: 'Mail' },
        { name: 'Echoing Void Mantle', slot: 'Shoulder', class: 'Armor', subclass: 'Cloth' },
        { name: 'Whisper-Inscribed Sash', slot: 'Waist', class: 'Armor', subclass: 'Cloth' },
        { name: 'Darkstrider Treads', slot: 'Feet', class: 'Armor', subclass: 'Mail' },
        { name: 'Radiant Plume', slot: 'Trinket', class: 'Armor', subclass: 'Trinket' },
        { name: 'The Eternal Egg', slot: 'Trinket', class: 'Armor', subclass: 'Trinket' },
        {
          name: 'Shadow of the Empyrean Requiem',
          slot: 'Trinket',
          class: 'Armor',
          subclass: 'Trinket',
        },
        {
          name: 'Light of the Cosmic Crescendo',
          slot: 'Trinket',
          class: 'Armor',
          subclass: 'Trinket',
        },
      ]),
    },
    {
      name: 'Midnight Falls',
      order: 2,
      difficulties: diffEntries([
        { name: 'Robes of Endless Oblivion', slot: 'Chest', class: 'Armor', subclass: 'Cloth' },
        { name: 'Mask of Darkest Intent', slot: 'Head', class: 'Armor', subclass: 'Leather' },
        { name: 'Oblivion Guise', slot: 'Head', class: 'Armor', subclass: 'Mail' },
        { name: 'Extinction Guards', slot: 'Legs', class: 'Armor', subclass: 'Plate' },
        { name: "Ashes of Belo'ren", slot: 'Trinket', class: 'Armor', subclass: 'Trinket' },
        { name: 'Umbral Plume', slot: 'Trinket', class: 'Armor', subclass: 'Trinket' },
        { name: "Sin'dorei Band of Hope", slot: 'Finger', class: 'Armor', subclass: 'Ring' },
        { name: 'Eye of Midnight', slot: 'Finger', class: 'Armor', subclass: 'Ring' },
        { name: 'Amulet of the Abyssal Hymn', slot: 'Neck', class: 'Armor', subclass: 'Amulet' },
        { name: 'Thalassian Dawnguard', slot: 'Off-Hand', class: 'Armor', subclass: 'Shield' },
        { name: 'Lightless Lament', slot: 'One-Hand', class: 'Weapon', subclass: 'Warglaive' },
      ]),
    },
  ],
};
