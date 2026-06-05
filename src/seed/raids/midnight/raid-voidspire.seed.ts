import { DifficultyName } from '../../../modules/difficulty/difficulty.entity';
import { RaidSeed } from '../types';

const lfr = DifficultyName.LFR;
const normal = DifficultyName.NORMAL;
const heroic = DifficultyName.HEROIC;
const mythic = DifficultyName.MYTHIC;

// Voidspire item levels (all bosses share same ilvl per difficulty)
const LFR_ILVL = 233;
const NORMAL_ILVL = 246;
const HEROIC_ILVL = 259;
const MYTHIC_ILVL = 272;

/**
 * Helper: given a list of items (name/slot/class/subclass), produce 4 difficulty
 * entries with appropriate ilvls.
 */
function diffEntries(items: { name: string; slot: string; class: string; subclass: string }[]) {
  const map = (ilvl: number) => items.map((i) => ({ ...i, ilvl }));
  return [
    { difficulty: lfr, items: map(LFR_ILVL) },
    { difficulty: normal, items: map(NORMAL_ILVL) },
    { difficulty: heroic, items: map(HEROIC_ILVL) },
    { difficulty: mythic, items: map(MYTHIC_ILVL) },
  ];
}

/**
 * Voidspire — 6 bosses, the longest Midnight raid of Season 1.
 * Drops helm, shoulder, gloves, and legs tier tokens.
 * Item levels: LFR 233, Normal 246, Heroic 259, Mythic 272.
 */
export const voidspireSeed: RaidSeed = {
  name: 'Voidspire',
  order: 1,
  expansionShortName: 'MIDNIGHT',
  patchNumbers: ['12.0.0', '12.0.2', '12.0.5'],
  bosses: [
    {
      name: 'Imperator Averzian',
      order: 1,
      difficulties: diffEntries([
        { name: 'Endless March Waistwrap', slot: 'Waist', class: 'Armor', subclass: 'Cloth' },
        {
          name: 'Leggings of the Devouring Advance',
          slot: 'Legs',
          class: 'Armor',
          subclass: 'Cloth',
        },
        { name: "Devouring Night's Visage", slot: 'Head', class: 'Armor', subclass: 'Leather' },
        { name: 'Void-Claimed Shinkickers', slot: 'Feet', class: 'Armor', subclass: 'Leather' },
        { name: 'Robes of the Voidbound', slot: 'Chest', class: 'Armor', subclass: 'Mail' },
        { name: 'Sabatons of Obscurement', slot: 'Feet', class: 'Armor', subclass: 'Mail' },
        { name: 'Light-Judged Spaulders', slot: 'Shoulder', class: 'Armor', subclass: 'Plate' },
        { name: "Light's March Bracers", slot: 'Wrist', class: 'Armor', subclass: 'Plate' },
        { name: "Imperator's Banner", slot: 'Back', class: 'Armor', subclass: 'Cloak' },
        { name: 'Weight of Command', slot: 'One-Hand', class: 'Weapon', subclass: 'Mace' },
        { name: 'Sunstrike Rifle', slot: 'Ranged', class: 'Weapon', subclass: 'Gun' },
        { name: 'Bulwark of Noble Resolve', slot: 'Off-Hand', class: 'Armor', subclass: 'Shield' },
        { name: 'Light Company Guidon', slot: 'Trinket', class: 'Armor', subclass: 'Trinket' },
      ]),
    },
    {
      name: 'Vorasius',
      order: 2,
      difficulties: diffEntries([
        { name: "Frenzy's Rebuke", slot: 'Head', class: 'Armor', subclass: 'Mail' },
        { name: 'Voracious Wristwraps', slot: 'Wrist', class: 'Armor', subclass: 'Cloth' },
        { name: 'Void-Skinned Bracers', slot: 'Wrist', class: 'Armor', subclass: 'Leather' },
        { name: 'Parasite Stompers', slot: 'Feet', class: 'Armor', subclass: 'Plate' },
        {
          name: 'Grimoire of the Eternal Light',
          slot: 'Off-Hand',
          class: 'Armor',
          subclass: 'Off-hand',
        },
        { name: 'Heart of Ancient Hunger', slot: 'Trinket', class: 'Armor', subclass: 'Trinket' },
        { name: 'Hungering Victory', slot: 'One-Hand', class: 'Weapon', subclass: 'Dagger' },
        { name: 'Inescapable Reach', slot: 'Two-Hand', class: 'Weapon', subclass: 'Polearm' },
        { name: 'Signet of the Starved Beast', slot: 'Finger', class: 'Armor', subclass: 'Ring' },
        { name: 'Voltaic Trigore Egg', slot: 'Trinket', class: 'Armor', subclass: 'Trinket' },
        // Tier token: Hands
        { name: 'Void-Touched Handguards', slot: 'Hands', class: 'Armor', subclass: 'Tier Token' },
      ]),
    },
    {
      name: 'Fallen-King Salhadaar',
      order: 3,
      difficulties: diffEntries([
        { name: 'Crown of the Fractured Tyrant', slot: 'Head', class: 'Armor', subclass: 'Plate' },
        { name: 'Despotic Raiment', slot: 'Chest', class: 'Armor', subclass: 'Cloth' },
        { name: "Fallen King's Cuffs", slot: 'Wrist', class: 'Armor', subclass: 'Mail' },
        { name: 'Twisted Twilight Sash', slot: 'Waist', class: 'Armor', subclass: 'Leather' },
        {
          name: 'Blade of the Final Twilight',
          slot: 'One-Hand',
          class: 'Weapon',
          subclass: 'Sword',
        },
        {
          name: "Tormentor's Bladed Fists",
          slot: 'One-Hand',
          class: 'Weapon',
          subclass: 'Fist Weapon',
        },
        { name: 'Ribbon of Coiled Malice', slot: 'Neck', class: 'Armor', subclass: 'Amulet' },
        { name: 'Volatile Void Suffuser', slot: 'Trinket', class: 'Armor', subclass: 'Trinket' },
        { name: 'Wraps of Cosmic Madness', slot: 'Trinket', class: 'Armor', subclass: 'Trinket' },
        // Tier token: Shoulders
        {
          name: 'Void-Touched Shoulderguards',
          slot: 'Shoulder',
          class: 'Armor',
          subclass: 'Tier Token',
        },
      ]),
    },
    {
      name: 'Vaelgor & Ezzorak',
      order: 4,
      difficulties: diffEntries([
        { name: "Nightblade's Pantaloons", slot: 'Legs', class: 'Armor', subclass: 'Leather' },
        { name: "Ezzorak's Gloombind", slot: 'Waist', class: 'Armor', subclass: 'Plate' },
        { name: "Vaelgor's Fearsome Grasp", slot: 'Hands', class: 'Armor', subclass: 'Leather' },
        { name: 'Slippers of the Midnight Flame', slot: 'Feet', class: 'Armor', subclass: 'Cloth' },
        {
          name: 'Blade of the Blind Verdict',
          slot: 'One-Hand',
          class: 'Weapon',
          subclass: 'Sword',
        },
        {
          name: "Ranger-Captain's Lethal Recurve",
          slot: 'Ranged',
          class: 'Weapon',
          subclass: 'Bow',
        },
        { name: "Clutchmates' Caress", slot: 'One-Hand', class: 'Weapon', subclass: 'Mace' },
        { name: 'Emblazoned Sunglaive', slot: 'One-Hand', class: 'Weapon', subclass: 'Warglaive' },
        // Tier token: Legs
        { name: 'Void-Touched Legplates', slot: 'Legs', class: 'Armor', subclass: 'Tier Token' },
      ]),
    },
    {
      name: 'Lightblinded Vanguard',
      order: 5,
      difficulties: diffEntries([
        { name: 'Gaze of the Unrestrained', slot: 'Head', class: 'Armor', subclass: 'Cloth' },
        { name: 'Lightblood Greaves', slot: 'Legs', class: 'Armor', subclass: 'Plate' },
        {
          name: "Nullwalker's Dread Epaulettes",
          slot: 'Shoulder',
          class: 'Armor',
          subclass: 'Mail',
        },
        { name: "Untethered Berserker's Grips", slot: 'Hands', class: 'Armor', subclass: 'Mail' },
        { name: "War Chaplain's Grips", slot: 'Hands', class: 'Armor', subclass: 'Cloth' },
        { name: "Bellamy's Final Judgement", slot: 'Two-Hand', class: 'Weapon', subclass: 'Mace' },
        // Tier token: Helm
        { name: 'Void-Touched Helm', slot: 'Head', class: 'Armor', subclass: 'Tier Token' },
      ]),
    },
    {
      name: 'Crown of the Cosmos',
      order: 6,
      difficulties: diffEntries([
        { name: "Turalyon's False Echo", slot: 'One-Hand', class: 'Weapon', subclass: 'Mace' },
        { name: 'Despotic Raiment', slot: 'Chest', class: 'Armor', subclass: 'Cloth' },
        { name: 'Sunbound Breastplate', slot: 'Chest', class: 'Armor', subclass: 'Plate' },
        { name: 'Robes of the Voidbound', slot: 'Chest', class: 'Armor', subclass: 'Mail' },
        { name: 'Light-Judged Spaulders', slot: 'Shoulder', class: 'Armor', subclass: 'Plate' },
        { name: 'Cosmic Ritual Stone', slot: 'Trinket', class: 'Armor', subclass: 'Trinket' },
        { name: "Sin'dorei Band of Hope", slot: 'Finger', class: 'Armor', subclass: 'Ring' },
        { name: 'Eye of Midnight', slot: 'Finger', class: 'Armor', subclass: 'Ring' },
        { name: 'Amulet of the Abyssal Hymn', slot: 'Neck', class: 'Armor', subclass: 'Amulet' },
        { name: 'Lightless Lament', slot: 'One-Hand', class: 'Weapon', subclass: 'Warglaive' },
        { name: 'Thalassian Dawnguard', slot: 'Off-Hand', class: 'Armor', subclass: 'Shield' },
      ]),
    },
  ],
};
