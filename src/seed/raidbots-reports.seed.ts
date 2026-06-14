import { Repository } from 'typeorm';
import { Character } from '../modules/character/character.entity';
import { Item } from '../modules/item/item.entity';
import { DifficultyName } from '../modules/difficulty/difficulty.entity';
import { RaidbotsReport } from '../modules/raidbots/raidbots-report.entity';
import { RaidbotsReportItem } from '../modules/raidbots/raidbots-report-item.entity';

interface ReportSeedEntry {
  characterName: string;
  itemName: string;
  difficulty: string;
  playerDpsMean: number;
  upgradeDpsMean: number;
  dpsImprovement: number;
}

/**
 * Each entry: a character has a simulated Raidbots report showing dps improvement
 * for a specific item. These use "Endless March Waistwrap" on Mythic as the test item.
 *
 * dpsImprovement values are chosen to produce varied gear upgrade scores:
 *   Valena: +450 (largest upgrade → will get 100 when normalized)
 *   Aurelora: +320
 *   Brox: +180
 *   Arya: +410
 *   Joren: +250
 *   (Seris and Lorien are not on raid roster, so they won't appear)
 */
const reports: ReportSeedEntry[] = [
  {
    characterName: 'Valena',
    itemName: 'Endless March Waistwrap',
    difficulty: 'Mythic',
    playerDpsMean: 85000,
    upgradeDpsMean: 85450,
    dpsImprovement: 450,
  },
  {
    characterName: 'Aurelora',
    itemName: 'Endless March Waistwrap',
    difficulty: 'Mythic',
    playerDpsMean: 82000,
    upgradeDpsMean: 82320,
    dpsImprovement: 320,
  },
  {
    characterName: 'Brox',
    itemName: 'Endless March Waistwrap',
    difficulty: 'Mythic',
    playerDpsMean: 70000,
    upgradeDpsMean: 70180,
    dpsImprovement: 180,
  },
  {
    characterName: 'Arya',
    itemName: 'Endless March Waistwrap',
    difficulty: 'Mythic',
    playerDpsMean: 78000,
    upgradeDpsMean: 78410,
    dpsImprovement: 410,
  },
  {
    characterName: 'Joren',
    itemName: 'Endless March Waistwrap',
    difficulty: 'Mythic',
    playerDpsMean: 72000,
    upgradeDpsMean: 72250,
    dpsImprovement: 250,
  },
];

/**
 * Seed simulated Raidbots reports with upgrade items for test characters.
 * Idempotent — skips if a report for this character+item combination already exists.
 */
export async function seedRaidbotsReports(
  characterRepo: Repository<Character>,
  itemRepo: Repository<Item>,
  reportRepo: Repository<RaidbotsReport>,
  reportItemRepo: Repository<RaidbotsReportItem>,
): Promise<void> {
  for (const entry of reports) {
    // Find character
    const character = await characterRepo.findOne({
      where: { name: entry.characterName, realm: 'Moon Guard' },
    });
    if (!character) {
      console.warn(`  ⚠ Character "${entry.characterName}" not found — skipping report`);
      continue;
    }

    // Find item by name + difficulty
    const item = await itemRepo.findOne({
      where: {
        normalizedName: entry.itemName.toLowerCase(),
        difficulty: { difficulty: entry.difficulty as unknown as DifficultyName },
      },
      relations: { difficulty: true },
    });
    if (!item) {
      console.warn(
        `  ⚠ Item "${entry.itemName}" (${entry.difficulty}) not found — skipping report for ${entry.characterName}`,
      );
      continue;
    }

    // Check if a report item already exists for this character + item combo
    const existing = await reportItemRepo.findOne({
      where: { itemId: item.id },
      relations: { report: true },
    });
    if (existing && existing.report.characterId === character.id) {
      console.log(`  ○ Report already exists: ${entry.characterName} → ${entry.itemName}`);
      continue;
    }

    // Check if a report already exists for this character (reuse if possible)
    let report = await reportRepo.findOne({
      where: { characterId: character.id },
      order: { createdAt: 'DESC' },
    });

    if (!report) {
      report = reportRepo.create({
        reportUrl: `https://www.raidbots.com/sim/report/test-${character.name.toLowerCase()}`,
        characterId: character.id,
        playerName: character.name,
        playerClass: character.playerClass,
        playerSpec: character.spec,
        playerDpsMean: entry.playerDpsMean,
        isValid: true,
      });
      report = await reportRepo.save(report);
      console.log(`  ✓ Created report for: ${entry.characterName}`);
    }

    // Create the report item
    await reportItemRepo.save(
      reportItemRepo.create({
        reportId: report.id,
        itemId: item.id,
        itemName: entry.itemName,
        playerDpsMean: entry.playerDpsMean,
        upgradeDpsMean: entry.upgradeDpsMean,
        dpsImprovement: entry.dpsImprovement,
      }),
    );
    console.log(
      `  ✓ Seeded report item: ${entry.characterName} → ${entry.itemName} (+${entry.dpsImprovement} dps)`,
    );
  }
}
