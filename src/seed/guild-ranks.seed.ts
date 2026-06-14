import { Repository } from 'typeorm';
import { Guild } from '../modules/guild/guild.entity';
import { GuildRank } from '../modules/guild/guild-rank.entity';

interface RankSeedEntry {
  name: string;
  priority: number;
  defaultLoyalty: number;
}

const ranks: RankSeedEntry[] = [
  { name: 'Guild Master', priority: 100, defaultLoyalty: 95 },
  { name: 'Officer', priority: 95, defaultLoyalty: 90 },
  { name: 'Core Raider', priority: 85, defaultLoyalty: 75 },
  { name: 'Raider', priority: 60, defaultLoyalty: 55 },
  { name: 'Trial', priority: 25, defaultLoyalty: 20 },
  { name: 'Social', priority: 5, defaultLoyalty: 10 },
];

/**
 * Seed rank definitions for the "Nighthaven" guild.
 * Idempotent — skips ranks that already exist for this guild.
 */
export async function seedGuildRanks(
  guildRepo: Repository<Guild>,
  rankRepo: Repository<GuildRank>,
): Promise<void> {
  const guild = await guildRepo.findOne({ where: { name: 'Nighthaven', realm: 'Moon Guard' } });
  if (!guild) {
    console.warn('  ⚠ Guild "Nighthaven" not found — skipping rank seed');
    return;
  }

  const existing = await rankRepo.find({ where: { guildId: guild.id } });
  const existingNames = new Set(existing.map((r) => r.name));

  for (const entry of ranks) {
    if (!existingNames.has(entry.name)) {
      await rankRepo.save(
        rankRepo.create({
          guildId: guild.id,
          name: entry.name,
          priority: entry.priority,
          defaultLoyalty: entry.defaultLoyalty,
        }),
      );
      console.log(
        `  ✓ Seeded rank: ${entry.name} (priority=${entry.priority}, loyalty=${entry.defaultLoyalty})`,
      );
    } else {
      console.log(`  ○ Rank already exists: ${entry.name}`);
    }
  }
}
