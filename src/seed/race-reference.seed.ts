import { Repository } from 'typeorm';
import { Race } from '../modules/character/race.entity';
import { RaceClass } from '../modules/character/race-class.entity';
import { ClassSpec } from '../modules/character/class-spec.entity';
import { ClassArmor } from '../modules/character/class-armor.entity';

/**
 * Seed all race/class/spec/armor reference data.
 * Cleared by the TRUNCATE in database-init.service.ts before this runs.
 */

type Faction = 'Alliance' | 'Horde';

const races: { name: string; faction: Faction }[] = [
  { name: 'Human', faction: 'Alliance' },
  { name: 'Dwarf', faction: 'Alliance' },
  { name: 'Night Elf', faction: 'Alliance' },
  { name: 'Gnome', faction: 'Alliance' },
  { name: 'Draenei', faction: 'Alliance' },
  { name: 'Worgen', faction: 'Alliance' },
  { name: 'Pandaren', faction: 'Alliance' },
  { name: 'Void Elf', faction: 'Alliance' },
  { name: 'Lightforged Draenei', faction: 'Alliance' },
  { name: 'Dark Iron Dwarf', faction: 'Alliance' },
  { name: 'Kul Tiran', faction: 'Alliance' },
  { name: 'Mechagnome', faction: 'Alliance' },
  { name: 'Earthen', faction: 'Alliance' },
  { name: 'Haranir', faction: 'Alliance' },
  { name: 'Orc', faction: 'Horde' },
  { name: 'Undead', faction: 'Horde' },
  { name: 'Tauren', faction: 'Horde' },
  { name: 'Troll', faction: 'Horde' },
  { name: 'Blood Elf', faction: 'Horde' },
  { name: 'Goblin', faction: 'Horde' },
  { name: 'Pandaren', faction: 'Horde' },
  { name: 'Nightborne', faction: 'Horde' },
  { name: 'Highmountain Tauren', faction: 'Horde' },
  { name: "Mag'har Orc", faction: 'Horde' },
  { name: 'Zandalari Troll', faction: 'Horde' },
  { name: 'Vulpera', faction: 'Horde' },
  { name: 'Earthen', faction: 'Horde' },
  { name: 'Haranir', faction: 'Horde' },
  { name: 'Dracthyr', faction: 'Alliance' },
  { name: 'Dracthyr', faction: 'Horde' },
];

/**
 * Race ↔ Class combinations.
 * Key = race name, Value = array of allowed class names.
 * Compiled for Midnight (patch 12.0.5).
 */
const raceClassCombos: Record<string, string[]> = {
  Human: [
    'Warrior',
    'Paladin',
    'Hunter',
    'Rogue',
    'Priest',
    'Death Knight',
    'Mage',
    'Warlock',
    'Monk',
  ],
  Dwarf: [
    'Warrior',
    'Paladin',
    'Hunter',
    'Rogue',
    'Priest',
    'Death Knight',
    'Shaman',
    'Mage',
    'Warlock',
    'Monk',
  ],
  'Night Elf': [
    'Warrior',
    'Hunter',
    'Rogue',
    'Priest',
    'Death Knight',
    'Mage',
    'Warlock',
    'Monk',
    'Druid',
    'Demon Hunter',
  ],
  Gnome: ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Death Knight', 'Mage', 'Warlock', 'Monk'],
  Draenei: [
    'Warrior',
    'Paladin',
    'Hunter',
    'Priest',
    'Death Knight',
    'Shaman',
    'Mage',
    'Warlock',
    'Monk',
  ],
  Worgen: ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Death Knight', 'Mage', 'Warlock', 'Druid'],
  Pandaren: ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Shaman', 'Mage', 'Warlock', 'Monk'],
  'Void Elf': ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Death Knight', 'Mage', 'Warlock', 'Monk'],
  'Lightforged Draenei': [
    'Warrior',
    'Paladin',
    'Hunter',
    'Priest',
    'Death Knight',
    'Mage',
    'Warlock',
    'Monk',
  ],
  'Dark Iron Dwarf': [
    'Warrior',
    'Paladin',
    'Hunter',
    'Rogue',
    'Priest',
    'Death Knight',
    'Shaman',
    'Mage',
    'Warlock',
    'Monk',
  ],
  'Kul Tiran': [
    'Warrior',
    'Hunter',
    'Rogue',
    'Priest',
    'Death Knight',
    'Shaman',
    'Mage',
    'Warlock',
    'Monk',
    'Druid',
  ],
  Mechagnome: ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Death Knight', 'Mage', 'Warlock', 'Monk'],
  Earthen: ['Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest', 'Shaman', 'Mage', 'Warlock', 'Monk'],
  Haranir: ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Shaman', 'Mage', 'Warlock', 'Monk', 'Druid'],
  Orc: [
    'Warrior',
    'Hunter',
    'Rogue',
    'Priest',
    'Death Knight',
    'Shaman',
    'Mage',
    'Warlock',
    'Monk',
  ],
  Undead: ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Death Knight', 'Mage', 'Warlock', 'Monk'],
  Tauren: ['Warrior', 'Paladin', 'Hunter', 'Priest', 'Death Knight', 'Shaman', 'Monk', 'Druid'],
  Troll: [
    'Warrior',
    'Hunter',
    'Rogue',
    'Priest',
    'Death Knight',
    'Shaman',
    'Mage',
    'Warlock',
    'Monk',
    'Druid',
  ],
  'Blood Elf': [
    'Warrior',
    'Paladin',
    'Hunter',
    'Rogue',
    'Priest',
    'Death Knight',
    'Mage',
    'Warlock',
    'Monk',
    'Demon Hunter',
  ],
  Goblin: ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Death Knight', 'Shaman', 'Mage', 'Warlock'],
  Nightborne: ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Death Knight', 'Mage', 'Warlock', 'Monk'],
  'Highmountain Tauren': ['Warrior', 'Hunter', 'Priest', 'Death Knight', 'Shaman', 'Monk', 'Druid'],
  "Mag'har Orc": [
    'Warrior',
    'Hunter',
    'Rogue',
    'Priest',
    'Death Knight',
    'Shaman',
    'Mage',
    'Warlock',
    'Monk',
  ],
  'Zandalari Troll': [
    'Warrior',
    'Paladin',
    'Hunter',
    'Rogue',
    'Priest',
    'Death Knight',
    'Shaman',
    'Mage',
    'Warlock',
    'Monk',
    'Druid',
  ],
  Vulpera: [
    'Warrior',
    'Hunter',
    'Rogue',
    'Priest',
    'Death Knight',
    'Shaman',
    'Mage',
    'Warlock',
    'Monk',
  ],
  Dracthyr: ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Mage', 'Warlock', 'Monk', 'Evoker'],
};

const classSpecs: { className: string; specName: string }[] = [
  { className: 'Warrior', specName: 'Arms' },
  { className: 'Warrior', specName: 'Fury' },
  { className: 'Warrior', specName: 'Protection' },
  { className: 'Paladin', specName: 'Holy' },
  { className: 'Paladin', specName: 'Protection' },
  { className: 'Paladin', specName: 'Retribution' },
  { className: 'Death Knight', specName: 'Blood' },
  { className: 'Death Knight', specName: 'Frost' },
  { className: 'Death Knight', specName: 'Unholy' },
  { className: 'Hunter', specName: 'Beast Mastery' },
  { className: 'Hunter', specName: 'Marksmanship' },
  { className: 'Hunter', specName: 'Survival' },
  { className: 'Shaman', specName: 'Elemental' },
  { className: 'Shaman', specName: 'Enhancement' },
  { className: 'Shaman', specName: 'Restoration' },
  { className: 'Evoker', specName: 'Devastation' },
  { className: 'Evoker', specName: 'Preservation' },
  { className: 'Evoker', specName: 'Augmentation' },
  { className: 'Rogue', specName: 'Assassination' },
  { className: 'Rogue', specName: 'Outlaw' },
  { className: 'Rogue', specName: 'Subtlety' },
  { className: 'Monk', specName: 'Brewmaster' },
  { className: 'Monk', specName: 'Mistweaver' },
  { className: 'Monk', specName: 'Windwalker' },
  { className: 'Druid', specName: 'Balance' },
  { className: 'Druid', specName: 'Feral' },
  { className: 'Druid', specName: 'Guardian' },
  { className: 'Druid', specName: 'Restoration' },
  { className: 'Demon Hunter', specName: 'Havoc' },
  { className: 'Demon Hunter', specName: 'Vengeance' },
  { className: 'Mage', specName: 'Arcane' },
  { className: 'Mage', specName: 'Fire' },
  { className: 'Mage', specName: 'Frost' },
  { className: 'Priest', specName: 'Discipline' },
  { className: 'Priest', specName: 'Holy' },
  { className: 'Priest', specName: 'Shadow' },
  { className: 'Warlock', specName: 'Affliction' },
  { className: 'Warlock', specName: 'Demonology' },
  { className: 'Warlock', specName: 'Destruction' },
];

const classArmor: { className: string; armorSubclass: string }[] = [
  { className: 'Warrior', armorSubclass: 'Plate' },
  { className: 'Paladin', armorSubclass: 'Plate' },
  { className: 'Death Knight', armorSubclass: 'Plate' },
  { className: 'Hunter', armorSubclass: 'Mail' },
  { className: 'Shaman', armorSubclass: 'Mail' },
  { className: 'Evoker', armorSubclass: 'Mail' },
  { className: 'Rogue', armorSubclass: 'Leather' },
  { className: 'Monk', armorSubclass: 'Leather' },
  { className: 'Druid', armorSubclass: 'Leather' },
  { className: 'Demon Hunter', armorSubclass: 'Leather' },
  { className: 'Mage', armorSubclass: 'Cloth' },
  { className: 'Priest', armorSubclass: 'Cloth' },
  { className: 'Warlock', armorSubclass: 'Cloth' },
];

export async function seedRaceReference(
  raceRepo: Repository<Race>,
  raceClassRepo: Repository<RaceClass>,
  classSpecRepo: Repository<ClassSpec>,
  classArmorRepo: Repository<ClassArmor>,
): Promise<void> {
  // 1. Seed races
  const raceByNameFaction = new Map<string, Race>();
  for (const r of races) {
    const race = raceRepo.create({ name: r.name, faction: r.faction });
    const saved = await raceRepo.save(race);
    raceByNameFaction.set(`${r.name}|${r.faction}`, saved);
  }
  console.log(`  ✓ Seeded ${races.length} races`);

  // 2. Seed race-class combinations
  // Dracthyr shares the same class combos across both factions
  for (const [raceName, classNames] of Object.entries(raceClassCombos)) {
    // Dracthyr has two rows — find both
    if (raceName === 'Dracthyr') {
      for (const faction of ['Alliance', 'Horde'] as Faction[]) {
        const race = raceByNameFaction.get(`Dracthyr|${faction}`);
        if (!race) continue;
        for (const cn of classNames) {
          await raceClassRepo.save(raceClassRepo.create({ raceId: race.id, className: cn }));
        }
      }
    } else {
      const race =
        raceByNameFaction.get(`${raceName}|Alliance`) ?? raceByNameFaction.get(`${raceName}|Horde`);
      if (!race) {
        console.warn(`  ⚠ Race "${raceName}" not found — skipping class combos`);
        continue;
      }
      for (const cn of classNames) {
        await raceClassRepo.save(raceClassRepo.create({ raceId: race.id, className: cn }));
      }
    }
  }
  console.log('  ✓ Seeded race ↔ class combinations');

  // 3. Seed class specs
  for (const cs of classSpecs) {
    await classSpecRepo.save(classSpecRepo.create(cs));
  }
  console.log(`  ✓ Seeded ${classSpecs.length} class ↔ spec entries`);

  // 4. Seed class armor
  for (const ca of classArmor) {
    await classArmorRepo.save(classArmorRepo.create(ca));
  }
  console.log(`  ✓ Seeded ${classArmor.length} class ↔ armor entries`);
}
