import { Repository } from 'typeorm';
import { Character } from '../modules/character/character.entity';
import { Item } from '../modules/item/item.entity';
import { DifficultyName } from '../modules/difficulty/difficulty.entity';
import { RaidbotsReport } from '../modules/raidbots/raidbots-report.entity';
import { RaidbotsReportItem } from '../modules/raidbots/raidbots-report-item.entity';

interface ReportSeedEntry {
  characterName: string;
  itemName: string;
  playerDpsMean: number;
  upgradeDpsMean: number;
  dpsImprovement: number;
}

/**
 * 16 characters × 4 items each = 64 report items.
 * Every item matches the character's class armor type.
 * Items drawn from Voidspire Mythic bosses.
 * dpsImprovement values varied from 50 to 500 for wide recommendation spread.
 */
const reports: ReportSeedEntry[] = [
  // ════ CLOTH (Valena, Arya, Mordris, Lyria) ═══════════════════
  // Valena — Priest (Holy) — Cloth
  {
    characterName: 'Valena',
    itemName: 'Endless March Waistwrap',
    playerDpsMean: 85000,
    upgradeDpsMean: 85450,
    dpsImprovement: 450,
  },
  {
    characterName: 'Valena',
    itemName: 'Leggings of the Devouring Advance',
    playerDpsMean: 85000,
    upgradeDpsMean: 85320,
    dpsImprovement: 320,
  },
  {
    characterName: 'Valena',
    itemName: 'Voracious Wristwraps',
    playerDpsMean: 85000,
    upgradeDpsMean: 85210,
    dpsImprovement: 210,
  },
  {
    characterName: 'Valena',
    itemName: 'Despotic Raiment',
    playerDpsMean: 85000,
    upgradeDpsMean: 85480,
    dpsImprovement: 480,
  },
  // Arya — Mage (Fire) — Cloth
  {
    characterName: 'Arya',
    itemName: 'Endless March Waistwrap',
    playerDpsMean: 78000,
    upgradeDpsMean: 78410,
    dpsImprovement: 410,
  },
  {
    characterName: 'Arya',
    itemName: 'Slippers of the Midnight Flame',
    playerDpsMean: 78000,
    upgradeDpsMean: 78350,
    dpsImprovement: 350,
  },
  {
    characterName: 'Arya',
    itemName: 'Gaze of the Unrestrained',
    playerDpsMean: 78000,
    upgradeDpsMean: 78300,
    dpsImprovement: 300,
  },
  {
    characterName: 'Arya',
    itemName: "War Chaplain's Grips",
    playerDpsMean: 78000,
    upgradeDpsMean: 78220,
    dpsImprovement: 220,
  },
  // Mordris — Warlock (Affliction) — Cloth
  {
    characterName: 'Mordris',
    itemName: 'Leggings of the Devouring Advance',
    playerDpsMean: 72000,
    upgradeDpsMean: 72500,
    dpsImprovement: 500,
  },
  {
    characterName: 'Mordris',
    itemName: 'Voracious Wristwraps',
    playerDpsMean: 72000,
    upgradeDpsMean: 72350,
    dpsImprovement: 350,
  },
  {
    characterName: 'Mordris',
    itemName: 'Despotic Raiment',
    playerDpsMean: 72000,
    upgradeDpsMean: 72250,
    dpsImprovement: 250,
  },
  {
    characterName: 'Mordris',
    itemName: 'Endless March Waistwrap',
    playerDpsMean: 72000,
    upgradeDpsMean: 72150,
    dpsImprovement: 150,
  },
  // Lyria — Priest (Shadow) — Cloth (off-roster)
  {
    characterName: 'Lyria',
    itemName: 'Gaze of the Unrestrained',
    playerDpsMean: 69000,
    upgradeDpsMean: 69380,
    dpsImprovement: 380,
  },
  {
    characterName: 'Lyria',
    itemName: "War Chaplain's Grips",
    playerDpsMean: 69000,
    upgradeDpsMean: 69250,
    dpsImprovement: 250,
  },
  {
    characterName: 'Lyria',
    itemName: 'Slippers of the Midnight Flame',
    playerDpsMean: 69000,
    upgradeDpsMean: 69180,
    dpsImprovement: 180,
  },
  {
    characterName: 'Lyria',
    itemName: 'Voracious Wristwraps',
    playerDpsMean: 69000,
    upgradeDpsMean: 69080,
    dpsImprovement: 80,
  },

  // ════ LEATHER (Seris, Korvax, Thenia, Elara) ════════════════
  // Seris — Druid (Balance) — Leather
  {
    characterName: 'Seris',
    itemName: "Devouring Night's Visage",
    playerDpsMean: 74000,
    upgradeDpsMean: 74420,
    dpsImprovement: 420,
  },
  {
    characterName: 'Seris',
    itemName: 'Void-Claimed Shinkickers',
    playerDpsMean: 74000,
    upgradeDpsMean: 74350,
    dpsImprovement: 350,
  },
  {
    characterName: 'Seris',
    itemName: 'Void-Skinned Bracers',
    playerDpsMean: 74000,
    upgradeDpsMean: 74200,
    dpsImprovement: 200,
  },
  {
    characterName: 'Seris',
    itemName: "Nightblade's Pantaloons",
    playerDpsMean: 74000,
    upgradeDpsMean: 74130,
    dpsImprovement: 130,
  },
  // Korvax — Rogue (Assassination) — Leather
  {
    characterName: 'Korvax',
    itemName: "Devouring Night's Visage",
    playerDpsMean: 81000,
    upgradeDpsMean: 81500,
    dpsImprovement: 500,
  },
  {
    characterName: 'Korvax',
    itemName: 'Void-Claimed Shinkickers',
    playerDpsMean: 81000,
    upgradeDpsMean: 81320,
    dpsImprovement: 320,
  },
  {
    characterName: 'Korvax',
    itemName: 'Twisted Twilight Sash',
    playerDpsMean: 81000,
    upgradeDpsMean: 81350,
    dpsImprovement: 350,
  },
  {
    characterName: 'Korvax',
    itemName: "Vaelgor's Fearsome Grasp",
    playerDpsMean: 81000,
    upgradeDpsMean: 81450,
    dpsImprovement: 450,
  },
  // Thenia — Monk (Windwalker) — Leather
  {
    characterName: 'Thenia',
    itemName: 'Void-Skinned Bracers',
    playerDpsMean: 76000,
    upgradeDpsMean: 76400,
    dpsImprovement: 400,
  },
  {
    characterName: 'Thenia',
    itemName: 'Twisted Twilight Sash',
    playerDpsMean: 76000,
    upgradeDpsMean: 76300,
    dpsImprovement: 300,
  },
  {
    characterName: 'Thenia',
    itemName: "Nightblade's Pantaloons",
    playerDpsMean: 76000,
    upgradeDpsMean: 76250,
    dpsImprovement: 250,
  },
  {
    characterName: 'Thenia',
    itemName: "Vaelgor's Fearsome Grasp",
    playerDpsMean: 76000,
    upgradeDpsMean: 76150,
    dpsImprovement: 150,
  },
  // Elara — Demon Hunter (Havoc) — Leather (off-roster)
  {
    characterName: 'Elara',
    itemName: "Devouring Night's Visage",
    playerDpsMean: 83000,
    upgradeDpsMean: 83350,
    dpsImprovement: 350,
  },
  {
    characterName: 'Elara',
    itemName: 'Void-Claimed Shinkickers',
    playerDpsMean: 83000,
    upgradeDpsMean: 83200,
    dpsImprovement: 200,
  },
  {
    characterName: 'Elara',
    itemName: 'Twisted Twilight Sash',
    playerDpsMean: 83000,
    upgradeDpsMean: 83450,
    dpsImprovement: 450,
  },
  {
    characterName: 'Elara',
    itemName: "Nightblade's Pantaloons",
    playerDpsMean: 83000,
    upgradeDpsMean: 83100,
    dpsImprovement: 100,
  },

  // ════ MAIL (Lorien, Nyssa, Thrak, Raszag) ══════════════════
  // Lorien — Shaman (Restoration) — Mail
  {
    characterName: 'Lorien',
    itemName: 'Robes of the Voidbound',
    playerDpsMean: 71000,
    upgradeDpsMean: 71350,
    dpsImprovement: 350,
  },
  {
    characterName: 'Lorien',
    itemName: 'Sabatons of Obscurement',
    playerDpsMean: 71000,
    upgradeDpsMean: 71250,
    dpsImprovement: 250,
  },
  {
    characterName: 'Lorien',
    itemName: "Frenzy's Rebuke",
    playerDpsMean: 71000,
    upgradeDpsMean: 71400,
    dpsImprovement: 400,
  },
  {
    characterName: 'Lorien',
    itemName: "Fallen King's Cuffs",
    playerDpsMean: 71000,
    upgradeDpsMean: 71150,
    dpsImprovement: 150,
  },
  // Nyssa — Shaman (Elemental) — Mail
  {
    characterName: 'Nyssa',
    itemName: 'Robes of the Voidbound',
    playerDpsMean: 80000,
    upgradeDpsMean: 80500,
    dpsImprovement: 500,
  },
  {
    characterName: 'Nyssa',
    itemName: "Fallen King's Cuffs",
    playerDpsMean: 80000,
    upgradeDpsMean: 80320,
    dpsImprovement: 320,
  },
  {
    characterName: 'Nyssa',
    itemName: "Nullwalker's Dread Epaulettes",
    playerDpsMean: 80000,
    upgradeDpsMean: 80400,
    dpsImprovement: 400,
  },
  {
    characterName: 'Nyssa',
    itemName: "Untethered Berserker's Grips",
    playerDpsMean: 80000,
    upgradeDpsMean: 80250,
    dpsImprovement: 250,
  },
  // Thrak — Hunter (Marksmanship) — Mail
  {
    characterName: 'Thrak',
    itemName: 'Sabatons of Obscurement',
    playerDpsMean: 75000,
    upgradeDpsMean: 75450,
    dpsImprovement: 450,
  },
  {
    characterName: 'Thrak',
    itemName: "Frenzy's Rebuke",
    playerDpsMean: 75000,
    upgradeDpsMean: 75300,
    dpsImprovement: 300,
  },
  {
    characterName: 'Thrak',
    itemName: "Nullwalker's Dread Epaulettes",
    playerDpsMean: 75000,
    upgradeDpsMean: 75200,
    dpsImprovement: 200,
  },
  {
    characterName: 'Thrak',
    itemName: "Untethered Berserker's Grips",
    playerDpsMean: 75000,
    upgradeDpsMean: 75350,
    dpsImprovement: 350,
  },
  // Raszag — Hunter (Beast Mastery) — Mail (off-roster)
  {
    characterName: 'Raszag',
    itemName: "Frenzy's Rebuke",
    playerDpsMean: 68000,
    upgradeDpsMean: 68350,
    dpsImprovement: 350,
  },
  {
    characterName: 'Raszag',
    itemName: "Fallen King's Cuffs",
    playerDpsMean: 68000,
    upgradeDpsMean: 68150,
    dpsImprovement: 150,
  },
  {
    characterName: 'Raszag',
    itemName: 'Robes of the Voidbound',
    playerDpsMean: 68000,
    upgradeDpsMean: 68400,
    dpsImprovement: 400,
  },
  {
    characterName: 'Raszag',
    itemName: 'Sabatons of Obscurement',
    playerDpsMean: 68000,
    upgradeDpsMean: 68100,
    dpsImprovement: 100,
  },

  // ════ PLATE (Aurelora, Brox, Joren, Saelara) ════════════════
  // Aurelora — Paladin (Retribution) — Plate
  {
    characterName: 'Aurelora',
    itemName: 'Light-Judged Spaulders',
    playerDpsMean: 82000,
    upgradeDpsMean: 82450,
    dpsImprovement: 450,
  },
  {
    characterName: 'Aurelora',
    itemName: "Light's March Bracers",
    playerDpsMean: 82000,
    upgradeDpsMean: 82300,
    dpsImprovement: 300,
  },
  {
    characterName: 'Aurelora',
    itemName: 'Crown of the Fractured Tyrant',
    playerDpsMean: 82000,
    upgradeDpsMean: 82400,
    dpsImprovement: 400,
  },
  {
    characterName: 'Aurelora',
    itemName: 'Sunbound Breastplate',
    playerDpsMean: 82000,
    upgradeDpsMean: 82250,
    dpsImprovement: 250,
  },
  // Brox — Warrior (Protection) — Plate
  {
    characterName: 'Brox',
    itemName: "Light's March Bracers",
    playerDpsMean: 70000,
    upgradeDpsMean: 70350,
    dpsImprovement: 350,
  },
  {
    characterName: 'Brox',
    itemName: 'Parasite Stompers',
    playerDpsMean: 70000,
    upgradeDpsMean: 70250,
    dpsImprovement: 250,
  },
  {
    characterName: 'Brox',
    itemName: "Ezzorak's Gloombind",
    playerDpsMean: 70000,
    upgradeDpsMean: 70500,
    dpsImprovement: 500,
  },
  {
    characterName: 'Brox',
    itemName: 'Lightblood Greaves',
    playerDpsMean: 70000,
    upgradeDpsMean: 70180,
    dpsImprovement: 180,
  },
  // Joren — Death Knight (Blood) — Plate
  {
    characterName: 'Joren',
    itemName: 'Light-Judged Spaulders',
    playerDpsMean: 73000,
    upgradeDpsMean: 73650,
    dpsImprovement: 350,
  },
  {
    characterName: 'Joren',
    itemName: 'Parasite Stompers',
    playerDpsMean: 73000,
    upgradeDpsMean: 73500,
    dpsImprovement: 500,
  },
  {
    characterName: 'Joren',
    itemName: 'Crown of the Fractured Tyrant',
    playerDpsMean: 73000,
    upgradeDpsMean: 73400,
    dpsImprovement: 400,
  },
  {
    characterName: 'Joren',
    itemName: 'Sunbound Breastplate',
    playerDpsMean: 73000,
    upgradeDpsMean: 73200,
    dpsImprovement: 200,
  },
  // Saelara — Paladin (Holy) — Plate (off-roster)
  {
    characterName: 'Saelara',
    itemName: 'Light-Judged Spaulders',
    playerDpsMean: 67000,
    upgradeDpsMean: 67400,
    dpsImprovement: 400,
  },
  {
    characterName: 'Saelara',
    itemName: "Light's March Bracers",
    playerDpsMean: 67000,
    upgradeDpsMean: 67300,
    dpsImprovement: 300,
  },
  {
    characterName: 'Saelara',
    itemName: "Ezzorak's Gloombind",
    playerDpsMean: 67000,
    upgradeDpsMean: 67200,
    dpsImprovement: 200,
  },
  {
    characterName: 'Saelara',
    itemName: 'Parasite Stompers',
    playerDpsMean: 67000,
    upgradeDpsMean: 67100,
    dpsImprovement: 100,
  },
];

export async function seedRaidbotsReports(
  characterRepo: Repository<Character>,
  itemRepo: Repository<Item>,
  reportRepo: Repository<RaidbotsReport>,
  reportItemRepo: Repository<RaidbotsReportItem>,
): Promise<void> {
  // Build character name → Character lookup
  const allChars = await characterRepo.find({ where: { realm: 'Moon Guard' } });
  const charByName = new Map(allChars.map((c) => [c.name, c]));

  // Track already-processed report IDs to avoid duplication in the new seed
  let processedCount = 0;

  for (const entry of reports) {
    const character = charByName.get(entry.characterName);
    if (!character) {
      console.warn(`  ⚠ Character "${entry.characterName}" not found — skipping`);
      continue;
    }

    // Find all Mythic items matching by name
    const items = await itemRepo.find({
      where: {
        normalizedName: entry.itemName.toLowerCase(),
      },
      relations: { difficulty: true },
    });
    const item = items.find((i) => i.difficulty?.difficulty === DifficultyName.MYTHIC);
    if (!item) {
      console.warn(
        `  ⚠ Item "${entry.itemName}" (Mythic) not found — skipping for ${entry.characterName}`,
      );
      continue;
    }

    // Find or create a single report per character
    let report = await reportRepo.findOne({
      where: { characterId: character.id },
      order: { createdAt: 'DESC' },
    });

    if (!report) {
      report = reportRepo.create({
        reportUrl: `https://www.raidbots.com/sim/report/seed-${character.name.toLowerCase()}`,
        characterId: character.id,
        playerName: character.name,
        playerClass: character.playerClass,
        playerSpec: character.spec?.specName ?? undefined,
        playerDpsMean: entry.playerDpsMean,
        isValid: true,
      });
      report = await reportRepo.save(report);
    }

    // Check if this report item already exists to avoid duplicates
    const existing = await reportItemRepo.findOne({
      where: { reportId: report.id, itemId: item.id },
    });
    if (existing) {
      continue; // skip duplicate
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
    processedCount++;
  }

  console.log(`  ✅ ${processedCount} report items seeded across ${allChars.length} characters`);
}
