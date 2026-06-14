import { Repository } from 'typeorm';
import { Account } from '../modules/account/account.entity';
import { Guild } from '../modules/guild/guild.entity';
import { Character } from '../modules/character/character.entity';

export interface CharacterSeedEntry {
  name: string;
  playerClass: string;
  spec: string;
  itemLevel: number;
  accountEmail: string;
  accountDisplayName: string;
}

const characters: CharacterSeedEntry[] = [
  {
    name: 'Aurelora',
    playerClass: 'Paladin',
    spec: 'Retribution',
    itemLevel: 630,
    accountEmail: 'aurelora@example.com',
    accountDisplayName: 'Aurelora',
  },
  {
    name: 'Valena',
    playerClass: 'Priest',
    spec: 'Holy',
    itemLevel: 645,
    accountEmail: 'valena@example.com',
    accountDisplayName: 'Valena',
  },
  {
    name: 'Brox',
    playerClass: 'Warrior',
    spec: 'Protection',
    itemLevel: 610,
    accountEmail: 'brox@example.com',
    accountDisplayName: 'Brox',
  },
  {
    name: 'Arya',
    playerClass: 'Mage',
    spec: 'Fire',
    itemLevel: 590,
    accountEmail: 'arya@example.com',
    accountDisplayName: 'Arya',
  },
  {
    name: 'Joren',
    playerClass: 'Death Knight',
    spec: 'Blood',
    itemLevel: 620,
    accountEmail: 'joren@example.com',
    accountDisplayName: 'Joren',
  },
  {
    name: 'Seris',
    playerClass: 'Druid',
    spec: 'Balance',
    itemLevel: 595,
    accountEmail: 'seris@example.com',
    accountDisplayName: 'Seris',
  },
  {
    name: 'Lorien',
    playerClass: 'Shaman',
    spec: 'Restoration',
    itemLevel: 580,
    accountEmail: 'lorien@example.com',
    accountDisplayName: 'Lorien',
  },
];

/**
 * Seed the guild "Nighthaven" on "Moon Guard" with multiple accounts and characters.
 * Idempotent — skips any character/account that already exists.
 */
export async function seedMoreCharacters(
  accountRepo: Repository<Account>,
  guildRepo: Repository<Guild>,
  characterRepo: Repository<Character>,
): Promise<void> {
  // Find the existing Nighthaven guild
  let guild = await guildRepo.findOne({ where: { name: 'Nighthaven', realm: 'Moon Guard' } });
  if (!guild) {
    guild = guildRepo.create({
      name: 'Nighthaven',
      realm: 'Moon Guard',
      faction: 'Alliance',
      guildType: 'guild',
    });
    guild = await guildRepo.save(guild);
    console.log(`  ✓ Created guild: ${guild.name}`);
  }

  for (const entry of characters) {
    // Upsert account
    let account = await accountRepo.findOne({ where: { email: entry.accountEmail } });
    if (!account) {
      account = accountRepo.create({
        email: entry.accountEmail,
        displayName: entry.accountDisplayName,
        isActive: true,
      });
      account = await accountRepo.save(account);
      console.log(`  ✓ Seeded account: ${account.email}`);
    }

    // Upsert character
    let character = await characterRepo.findOne({
      where: { name: entry.name, realm: 'Moon Guard' },
    });
    if (!character) {
      character = characterRepo.create({
        name: entry.name,
        realm: 'Moon Guard',
        faction: 'Alliance',
        playerClass: entry.playerClass,
        spec: entry.spec,
        itemLevel: entry.itemLevel,
        accountId: account.id,
        guildId: guild.id,
      });
      character = await characterRepo.save(character);
      console.log(`  ✓ Seeded character: ${character.name} (${entry.playerClass} - ${entry.spec})`);
    } else {
      console.log(`  ○ Character already exists: ${character.name}`);
    }
  }

  console.log(`  ✅ ${characters.length} characters processed`);
}
