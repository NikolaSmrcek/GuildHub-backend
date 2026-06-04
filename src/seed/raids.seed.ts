import { Repository } from 'typeorm';
import { Raid } from '../modules/raid/raid.entity';
import { Boss } from '../modules/boss/boss.entity';
import { Difficulty, DifficultyName } from '../modules/difficulty/difficulty.entity';
import { Item } from '../modules/item/item.entity';
import { ExpansionRepository } from '../modules/expansion/expansion.repository';

interface ItemSeed {
  name: string;
  ilvl: number;
  slot?: string;
  class?: string;
  subclass?: string;
}

interface DifficultySeed {
  difficulty: DifficultyName;
  items: ItemSeed[];
}

interface BossSeed {
  name: string;
  order: number;
  difficulties: DifficultySeed[];
}

interface RaidSeed {
  name: string;
  order: number;
  expansionShortName: string;
  patchNumbers: string[];
  bosses: BossSeed[];
}

/** Midnight expansion raids */
const midnightRaids: RaidSeed[] = [
  {
    name: 'Voidspire',
    order: 1,
    expansionShortName: 'MIDNIGHT',
    patchNumbers: ['12.0.0', '12.0.2', '12.0.5'],
    bosses: [
      {
        name: 'Imperator Averzian',
        order: 1,
        difficulties: [
          {
            difficulty: DifficultyName.LFR,
            items: [
              {
                name: 'Endless March Waistwrap',
                ilvl: 480,
                slot: 'Waist',
                class: 'Armor',
                subclass: 'Cloth',
              },
            ],
          },
          {
            difficulty: DifficultyName.NORMAL,
            items: [
              {
                name: 'Endless March Waistwrap',
                ilvl: 493,
                slot: 'Waist',
                class: 'Armor',
                subclass: 'Cloth',
              },
            ],
          },
          {
            difficulty: DifficultyName.HEROIC,
            items: [
              {
                name: 'Endless March Waistwrap',
                ilvl: 506,
                slot: 'Waist',
                class: 'Armor',
                subclass: 'Cloth',
              },
            ],
          },
          {
            difficulty: DifficultyName.MYTHIC,
            items: [
              {
                name: 'Endless March Waistwrap',
                ilvl: 519,
                slot: 'Waist',
                class: 'Armor',
                subclass: 'Cloth',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Dreamrift',
    order: 2,
    expansionShortName: 'MIDNIGHT',
    patchNumbers: ['12.0.0', '12.0.2', '12.0.5'],
    bosses: [],
  },
  {
    name: "March on Quel'Danas",
    order: 3,
    expansionShortName: 'MIDNIGHT',
    patchNumbers: ['12.0.0', '12.0.2', '12.0.5'],
    bosses: [],
  },
];

export async function seedRaids(
  expansionRepo: ExpansionRepository,
  raidRepo: Repository<Raid>,
  bossRepo: Repository<Boss>,
  difficultyRepo: Repository<Difficulty>,
  itemRepo: Repository<Item>,
): Promise<void> {
  const allExpansions = await expansionRepo.findAll();
  const expansionByShortName = new Map(allExpansions.map((e) => [e.shortName, e]));

  for (const raidSeed of midnightRaids) {
    const expansion = expansionByShortName.get(raidSeed.expansionShortName);
    if (!expansion) {
      console.warn(
        `  ⚠ Expansion ${raidSeed.expansionShortName} not found, skipping raid ${raidSeed.name}`,
      );
      continue;
    }

    // Check if raid already exists
    const existingRaids = await raidRepo.find({
      where: { name: raidSeed.name, expansionId: expansion.id },
    });
    if (existingRaids.length > 0) {
      console.log(`  - Skipping already-seeded raid: ${raidSeed.name}`);
      continue;
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
}
