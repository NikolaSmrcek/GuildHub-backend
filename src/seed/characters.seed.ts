import { Repository } from 'typeorm';
import { Account } from '../modules/account/account.entity';
import { Guild } from '../modules/guild/guild.entity';
import { Character } from '../modules/character/character.entity';

/**
 * Seed an account, guild, and character for "Aurelora".
 *
 * This seed:
 * 1. Creates an Account for aurelora@example.com (if not exists)
 * 2. Creates a Guild "Nighthaven" on "Moon Guard" (if not exists)
 * 3. Creates the Character "Aurelora" tied to the account and guild (if not exists)
 */
export async function seedCharacters(
  accountRepo: Repository<Account>,
  guildRepo: Repository<Guild>,
  characterRepo: Repository<Character>,
): Promise<void> {
  // ── Account ───────────────────────────────────────────────
  const accountEmail = 'aurelora@example.com';
  let account = await accountRepo.findOne({ where: { email: accountEmail } });
  if (!account) {
    account = accountRepo.create({
      email: accountEmail,
      displayName: 'Aurelora',
      isActive: true,
    });
    account = await accountRepo.save(account);
    console.log(`  ✓ Seeded account: ${account.email}`);
  } else {
    console.log(`  ○ Account already exists: ${account.email}`);
  }

  // ── Guild ─────────────────────────────────────────────────
  const guildName = 'Nighthaven';
  const guildRealm = 'Moon Guard';
  let guild = await guildRepo.findOne({ where: { name: guildName, realm: guildRealm } });
  if (!guild) {
    guild = guildRepo.create({
      name: guildName,
      realm: guildRealm,
      faction: 'Alliance',
      guildType: 'guild',
    });
    guild = await guildRepo.save(guild);
    console.log(`  ✓ Seeded guild: ${guild.name} (${guild.realm})`);
  } else {
    console.log(`  ○ Guild already exists: ${guild.name} (${guild.realm})`);
  }

  // ── Character ─────────────────────────────────────────────
  const characterName = 'Aurelora';
  const characterRealm = 'Moon Guard';
  let character = await characterRepo.findOne({
    where: { name: characterName, realm: characterRealm },
  });
  if (!character) {
    character = characterRepo.create({
      name: characterName,
      realm: characterRealm,
      faction: 'Alliance',
      playerClass: 'Paladin',
      spec: 'Retribution',
      itemLevel: 630,
      accountId: account.id,
      guildId: guild.id,
    });
    character = await characterRepo.save(character);
    console.log(`  ✓ Seeded character: ${character.name} (${character.realm})`);
  } else {
    console.log(`  ○ Character already exists: ${character.name} (${character.realm})`);
  }
}
