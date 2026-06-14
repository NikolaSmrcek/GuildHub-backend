import { Repository } from 'typeorm';
import { Guild } from '../modules/guild/guild.entity';
import { GuildRank } from '../modules/guild/guild-rank.entity';
import { GuildMember } from '../modules/guild/guild-member.entity';
import { Character } from '../modules/character/character.entity';

interface MemberSeedEntry {
  characterName: string;
  rankName: string;
  loyaltyOverride: number | null;
  isOnRaidRoster: boolean;
}

const members: MemberSeedEntry[] = [
  {
    characterName: 'Aurelora',
    rankName: 'Core Raider',
    loyaltyOverride: null,
    isOnRaidRoster: true,
  },
  { characterName: 'Valena', rankName: 'Core Raider', loyaltyOverride: 80, isOnRaidRoster: true },
  { characterName: 'Brox', rankName: 'Raider', loyaltyOverride: null, isOnRaidRoster: true },
  { characterName: 'Joren', rankName: 'Raider', loyaltyOverride: null, isOnRaidRoster: true },
  { characterName: 'Arya', rankName: 'Trial', loyaltyOverride: null, isOnRaidRoster: true },
  { characterName: 'Seris', rankName: 'Trial', loyaltyOverride: null, isOnRaidRoster: false },
  { characterName: 'Lorien', rankName: 'Social', loyaltyOverride: null, isOnRaidRoster: false },
];

/**
 * Assign ranks and roster status for Nighthaven characters.
 * Idempotent — skips member records that already exist.
 */
export async function seedGuildMembers(
  guildRepo: Repository<Guild>,
  rankRepo: Repository<GuildRank>,
  characterRepo: Repository<Character>,
  memberRepo: Repository<GuildMember>,
): Promise<void> {
  const guild = await guildRepo.findOne({ where: { name: 'Nighthaven', realm: 'Moon Guard' } });
  if (!guild) {
    console.warn('  ⚠ Guild "Nighthaven" not found — skipping member seed');
    return;
  }

  // Build lookup: character name → Character
  const allChars = await characterRepo.find({ where: { guildId: guild.id } });
  const charByName = new Map(allChars.map((c) => [c.name, c]));

  // Build lookup: rank name → GuildRank
  const allRanks = await rankRepo.find({ where: { guildId: guild.id } });
  const rankByName = new Map(allRanks.map((r) => [r.name, r]));

  // Check existing members to avoid duplicates
  const existingMembers = await memberRepo.find({ where: { guildId: guild.id } });
  const existingCharIds = new Set(existingMembers.map((m) => m.characterId));

  for (const entry of members) {
    const character = charByName.get(entry.characterName);
    if (!character) {
      console.warn(`  ⚠ Character "${entry.characterName}" not found — skipping`);
      continue;
    }

    if (existingCharIds.has(character.id)) {
      console.log(`  ○ Member already exists: ${entry.characterName}`);
      continue;
    }

    const rank = rankByName.get(entry.rankName);
    if (!rank) {
      console.warn(`  ⚠ Rank "${entry.rankName}" not found — skipping ${entry.characterName}`);
      continue;
    }

    await memberRepo.save(
      memberRepo.create({
        guildId: guild.id,
        characterId: character.id,
        rankId: rank.id,
        loyaltyOverride: entry.loyaltyOverride,
        isOnRaidRoster: entry.isOnRaidRoster,
      }),
    );
    console.log(
      `  ✓ Seeded member: ${entry.characterName} → ${entry.rankName} (roster: ${entry.isOnRaidRoster})`,
    );
  }
}
