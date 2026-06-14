import { Repository } from 'typeorm';
import { Account } from '../modules/account/account.entity';
import { Guild } from '../modules/guild/guild.entity';
import { Character } from '../modules/character/character.entity';
import { Race } from '../modules/character/race.entity';
import { Spec } from '../modules/character/spec.entity';

export interface CharacterSeedEntry {
  name: string;
  raceName: string;
  playerClass: string;
  specName: string;
  itemLevel: number;
  accountEmail: string;
  accountDisplayName: string;
}

const characters: CharacterSeedEntry[] = [
  // ── Cloth (4) ─────────────────────────────────────────────
  {
    name: 'Valena',
    raceName: 'Human',
    playerClass: 'Priest',
    specName: 'Holy',
    itemLevel: 645,
    accountEmail: 'valena@example.com',
    accountDisplayName: 'Valena',
  },
  {
    name: 'Arya',
    raceName: 'Gnome',
    playerClass: 'Mage',
    specName: 'Fire',
    itemLevel: 590,
    accountEmail: 'arya@example.com',
    accountDisplayName: 'Arya',
  },
  {
    name: 'Mordris',
    raceName: 'Human',
    playerClass: 'Warlock',
    specName: 'Affliction',
    itemLevel: 610,
    accountEmail: 'mordris@example.com',
    accountDisplayName: 'Mordris',
  },
  {
    name: 'Lyria',
    raceName: 'Void Elf',
    playerClass: 'Priest',
    specName: 'Shadow',
    itemLevel: 605,
    accountEmail: 'lyria@example.com',
    accountDisplayName: 'Lyria',
  },
  // ── Leather (4) ───────────────────────────────────────────
  {
    name: 'Seris',
    raceName: 'Night Elf',
    playerClass: 'Druid',
    specName: 'Balance',
    itemLevel: 595,
    accountEmail: 'seris@example.com',
    accountDisplayName: 'Seris',
  },
  {
    name: 'Korvax',
    raceName: 'Worgen',
    playerClass: 'Rogue',
    specName: 'Assassination',
    itemLevel: 615,
    accountEmail: 'korvax@example.com',
    accountDisplayName: 'Korvax',
  },
  {
    name: 'Thenia',
    raceName: 'Night Elf',
    playerClass: 'Monk',
    specName: 'Windwalker',
    itemLevel: 600,
    accountEmail: 'thenia@example.com',
    accountDisplayName: 'Thenia',
  },
  {
    name: 'Elara',
    raceName: 'Night Elf',
    playerClass: 'Demon Hunter',
    specName: 'Havoc',
    itemLevel: 620,
    accountEmail: 'elara@example.com',
    accountDisplayName: 'Elara',
  },
  // ── Mail (4) ──────────────────────────────────────────────
  {
    name: 'Lorien',
    raceName: 'Dwarf',
    playerClass: 'Shaman',
    specName: 'Restoration',
    itemLevel: 580,
    accountEmail: 'lorien@example.com',
    accountDisplayName: 'Lorien',
  },
  {
    name: 'Nyssa',
    raceName: 'Draenei',
    playerClass: 'Shaman',
    specName: 'Elemental',
    itemLevel: 625,
    accountEmail: 'nyssa@example.com',
    accountDisplayName: 'Nyssa',
  },
  {
    name: 'Thrak',
    raceName: 'Dwarf',
    playerClass: 'Hunter',
    specName: 'Marksmanship',
    itemLevel: 595,
    accountEmail: 'thrak@example.com',
    accountDisplayName: 'Thrak',
  },
  {
    name: 'Raszag',
    raceName: 'Draenei',
    playerClass: 'Hunter',
    specName: 'Beast Mastery',
    itemLevel: 585,
    accountEmail: 'raszag@example.com',
    accountDisplayName: 'Raszag',
  },
  // ── Plate (4) ─────────────────────────────────────────────
  {
    name: 'Aurelora',
    raceName: 'Human',
    playerClass: 'Paladin',
    specName: 'Retribution',
    itemLevel: 630,
    accountEmail: 'aurelora@example.com',
    accountDisplayName: 'Aurelora',
  },
  {
    name: 'Brox',
    raceName: 'Human',
    playerClass: 'Warrior',
    specName: 'Protection',
    itemLevel: 610,
    accountEmail: 'brox@example.com',
    accountDisplayName: 'Brox',
  },
  {
    name: 'Joren',
    raceName: 'Human',
    playerClass: 'Death Knight',
    specName: 'Blood',
    itemLevel: 620,
    accountEmail: 'joren@example.com',
    accountDisplayName: 'Joren',
  },
  {
    name: 'Saelara',
    raceName: 'Human',
    playerClass: 'Paladin',
    specName: 'Holy',
    itemLevel: 635,
    accountEmail: 'saelara@example.com',
    accountDisplayName: 'Saelara',
  },
];

/**
 * Seed characters for the guild "Nighthaven" on "Moon Guard".
 * Uses raceId and specId FK references instead of string columns.
 */
export async function seedMoreCharacters(
  accountRepo: Repository<Account>,
  guildRepo: Repository<Guild>,
  characterRepo: Repository<Character>,
  raceRepo: Repository<Race>,
  specRepo: Repository<Spec>,
): Promise<void> {
  const guild = await guildRepo.findOne({ where: { name: 'Nighthaven', realm: 'Moon Guard' } });
  if (!guild) {
    throw new Error('Guild "Nighthaven" not found');
  }

  // Pre-load race and spec lookups
  const allRaces = await raceRepo.find();
  const raceMap = new Map(allRaces.map((r) => [`${r.name}|Alliance`, r.id]));
  const allSpecs = await specRepo.find();
  const specMap = new Map(allSpecs.map((s) => [`${s.className}|${s.specName}`, s.id]));

  for (const entry of characters) {
    let account = await accountRepo.findOne({ where: { email: entry.accountEmail } });
    if (!account) {
      account = accountRepo.create({
        email: entry.accountEmail,
        displayName: entry.accountDisplayName,
        isActive: true,
      });
      account = await accountRepo.save(account);
    }

    const raceId = raceMap.get(`${entry.raceName}|Alliance`);
    const specId = specMap.get(`${entry.playerClass}|${entry.specName}`);

    if (!raceId) {
      console.warn(`  ⚠ Race "${entry.raceName}" not found — skipping ${entry.name}`);
      continue;
    }
    if (!specId) {
      console.warn(
        `  ⚠ Spec "${entry.playerClass}/${entry.specName}" not found — skipping ${entry.name}`,
      );
      continue;
    }

    let character = await characterRepo.findOne({
      where: { name: entry.name, realm: 'Moon Guard' },
    });
    if (!character) {
      character = characterRepo.create({
        name: entry.name,
        realm: 'Moon Guard',
        faction: 'Alliance',
        raceId,
        playerClass: entry.playerClass,
        specId,
        itemLevel: entry.itemLevel,
        accountId: account.id,
        guildId: guild.id,
      });
      character = await characterRepo.save(character);
      console.log(
        `  ✓ Seeded character: ${character.name} (${entry.raceName} ${entry.playerClass} - ${entry.specName})`,
      );
    } else {
      console.log(`  ○ Character already exists: ${character.name}`);
    }
  }

  console.log(`  ✅ ${characters.length} characters processed`);
}
