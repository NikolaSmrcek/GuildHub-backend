import { Repository } from 'typeorm';
import { Raid } from '../modules/raid/raid.entity';
import { Boss } from '../modules/boss/boss.entity';
import { Difficulty } from '../modules/difficulty/difficulty.entity';
import { Item } from '../modules/item/item.entity';
import { ExpansionRepository } from '../modules/expansion/expansion.repository';
import { RaidSeed } from './raids/types';
import { voidspireSeed } from './raids/midnight/raid-voidspire.seed';
import { dreamriftSeed } from './raids/midnight/raid-dreamrift.seed';
import { marchOnQueldanasSeed } from './raids/midnight/raid-march-on-queldanas.seed';

/** All raid seeds, combined from individual per-raid files. */
const raidSeeds: RaidSeed[] = [voidspireSeed, dreamriftSeed, marchOnQueldanasSeed];

async function seedRaid(
  raidRepo: Repository<Raid>,
  bossRepo: Repository<Boss>,
  difficultyRepo: Repository<Difficulty>,
  itemRepo: Repository<Item>,
  expansionByShortName: Map<string, { id: string }>,
  raidSeed: RaidSeed,
): Promise<void> {
  const expansion = expansionByShortName.get(raidSeed.expansionShortName);
  if (!expansion) {
    console.warn(
      `  ⚠ Expansion ${raidSeed.expansionShortName} not found, skipping raid ${raidSeed.name}`,
    );
    return;
  }

  // Check if raid already exists
  const existingRaids = await raidRepo.find({
    where: { name: raidSeed.name, expansionId: expansion.id },
  });
  if (existingRaids.length > 0) {
    console.log(`  - Skipping already-seeded raid: ${raidSeed.name}`);
    return;
  }

  const raid = await raidRepo.save(
    raidRepo.create({
      name: raidSeed.name,
      expansionId: expansion.id,
      order: raidSeed.order,
    }),
  );
  console.log(`  ✓ Seeded raid: ${raidSeed.name}`);

  // Seed bosses
  for (const bossSeed of raidSeed.bosses) {
    const boss = await bossRepo.save(
      bossRepo.create({
        name: bossSeed.name,
        raidId: raid.id,
        order: bossSeed.order,
      }),
    );
    console.log(`    ✓ Seeded boss: ${bossSeed.name}`);

    // Seed difficulties
    for (const diffSeed of bossSeed.difficulties) {
      const difficulty = await difficultyRepo.save(
        difficultyRepo.create({
          bossId: boss.id,
          difficulty: diffSeed.difficulty,
        }),
      );
      console.log(`      ✓ Seeded difficulty: ${diffSeed.difficulty}`);

      // Seed items
      for (const itemSeed of diffSeed.items) {
        await itemRepo.save(
          itemRepo.create({
            name: itemSeed.name,
            difficultyId: difficulty.id,
            ilvl: itemSeed.ilvl,
            slot: itemSeed.slot,
            class: itemSeed.class,
            subclass: itemSeed.subclass,
          }),
        );
        console.log(`        ✓ Seeded item: ${itemSeed.name} (ilvl ${itemSeed.ilvl})`);
      }
    }
  }
}

export async function seedRaids(
  expansionRepo: ExpansionRepository,
  raidRepo: Repository<Raid>,
  bossRepo: Repository<Boss>,
  difficultyRepo: Repository<Difficulty>,
  itemRepo: Repository<Item>,
): Promise<void> {
  const allExpansions = await expansionRepo.findAll();
  const expansionByShortName = new Map(allExpansions.map((e) => [e.shortName, e]));

  for (const raidSeed of raidSeeds) {
    await seedRaid(raidRepo, bossRepo, difficultyRepo, itemRepo, expansionByShortName, raidSeed);
  }
}
