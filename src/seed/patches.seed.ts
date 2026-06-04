import { Repository } from 'typeorm';
import { ExpansionRepository } from '../modules/expansion/expansion.repository';
import { PatchRepository } from '../modules/patch/patch.repository';
import { Patch } from '../modules/patch/patch.entity';
import { Season } from '../modules/season/season.entity';

interface PatchConfig {
  number: string;
  name: string;
  seasonName: string;
}

const patchesByExpansion: Record<string, PatchConfig[]> = {
  CLASSIC: [
    { number: '1.1.0', name: '1.1.0', seasonName: 'Season 1' },
    { number: '1.2.0', name: '1.2.0', seasonName: 'Season 1' },
    { number: '1.3.0', name: '1.3.0', seasonName: 'Season 1' },
    { number: '1.4.0', name: '1.4.0', seasonName: 'Season 1' },
    { number: '1.5.0', name: '1.5.0', seasonName: 'Season 1' },
    { number: '1.6.0', name: '1.6.0', seasonName: 'Season 1' },
    { number: '1.7.0', name: '1.7.0', seasonName: 'Season 1' },
    { number: '1.8.0', name: '1.8.0', seasonName: 'Season 1' },
    { number: '1.9.0', name: '1.9.0', seasonName: 'Season 1' },
    { number: '1.10.0', name: '1.10.0', seasonName: 'Season 2' },
    { number: '1.11.0', name: '1.11.0', seasonName: 'Season 2' },
    { number: '1.12.0', name: '1.12.0', seasonName: 'Season 2' },
  ],
  TBC: [
    { number: '2.0.1', name: '2.0.1', seasonName: 'Season 1' },
    { number: '2.0.3', name: '2.0.3', seasonName: 'Season 1' },
    { number: '2.1.0', name: '2.1.0', seasonName: 'Season 1' },
    { number: '2.2.0', name: '2.2.0', seasonName: 'Season 1' },
    { number: '2.3.0', name: '2.3.0', seasonName: 'Season 1' },
    { number: '2.4.0', name: '2.4.0', seasonName: 'Season 1' },
  ],
  WOTLK: [
    { number: '3.0.2', name: '3.0.2', seasonName: 'Season 1' },
    { number: '3.0.8', name: '3.0.8', seasonName: 'Season 1' },
    { number: '3.1.0', name: '3.1.0', seasonName: 'Season 1' },
    { number: '3.2.0', name: '3.2.0', seasonName: 'Season 1' },
    { number: '3.3.0', name: '3.3.0', seasonName: 'Season 1' },
    { number: '3.3.5', name: '3.3.5', seasonName: 'Season 1' },
  ],
  CATA: [
    { number: '4.0.1', name: '4.0.1', seasonName: 'Season 1' },
    { number: '4.0.3', name: '4.0.3', seasonName: 'Season 1' },
    { number: '4.0.6', name: '4.0.6', seasonName: 'Season 1' },
    { number: '4.1.0', name: '4.1.0', seasonName: 'Season 1' },
    { number: '4.2.0', name: '4.2.0', seasonName: 'Season 1' },
    { number: '4.3.0', name: '4.3.0', seasonName: 'Season 1' },
  ],
  MOP: [
    { number: '5.0.4', name: '5.0.4', seasonName: 'Season 1' },
    { number: '5.1.0', name: '5.1.0', seasonName: 'Season 1' },
    { number: '5.2.0', name: '5.2.0', seasonName: 'Season 1' },
    { number: '5.3.0', name: '5.3.0', seasonName: 'Season 1' },
    { number: '5.4.0', name: '5.4.0', seasonName: 'Season 1' },
  ],
  WOD: [
    { number: '6.0.2', name: '6.0.2', seasonName: 'Season 1' },
    { number: '6.0.3', name: '6.0.3', seasonName: 'Season 1' },
    { number: '6.1.0', name: '6.1.0', seasonName: 'Season 1' },
    { number: '6.2.0', name: '6.2.0', seasonName: 'Season 1' },
  ],
  LEGION: [
    { number: '7.0.3', name: '7.0.3', seasonName: 'Season 1' },
    { number: '7.1.0', name: '7.1.0', seasonName: 'Season 1' },
    { number: '7.1.5', name: '7.1.5', seasonName: 'Season 1' },
    { number: '7.2.0', name: '7.2.0', seasonName: 'Season 1' },
    { number: '7.2.5', name: '7.2.5', seasonName: 'Season 1' },
    { number: '7.3.0', name: '7.3.0', seasonName: 'Season 1' },
    { number: '7.3.5', name: '7.3.5', seasonName: 'Season 1' },
  ],
  BFA: [
    { number: '8.0.1', name: '8.0.1', seasonName: 'Season 1' },
    { number: '8.1.0', name: '8.1.0', seasonName: 'Season 1' },
    { number: '8.1.5', name: '8.1.5', seasonName: 'Season 1' },
    { number: '8.2.0', name: '8.2.0', seasonName: 'Season 1' },
    { number: '8.2.5', name: '8.2.5', seasonName: 'Season 1' },
    { number: '8.3.0', name: '8.3.0', seasonName: 'Season 1' },
  ],
  SL: [
    { number: '9.0.1', name: '9.0.1', seasonName: 'Season 1' },
    { number: '9.0.2', name: '9.0.2', seasonName: 'Season 1' },
    { number: '9.0.5', name: '9.0.5', seasonName: 'Season 1' },
    { number: '9.1.0', name: '9.1.0', seasonName: 'Season 1' },
    { number: '9.1.5', name: '9.1.5', seasonName: 'Season 1' },
    { number: '9.2.0', name: '9.2.0', seasonName: 'Season 1' },
    { number: '9.2.5', name: '9.2.5', seasonName: 'Season 1' },
  ],
  DF: [
    { number: '10.0.0', name: '10.0.0', seasonName: 'Season 1' },
    { number: '10.0.2', name: '10.0.2', seasonName: 'Season 1' },
    { number: '10.0.5', name: '10.0.5', seasonName: 'Season 1' },
    { number: '10.0.7', name: '10.0.7', seasonName: 'Season 1' },
    { number: '10.1.0', name: '10.1.0', seasonName: 'Season 1' },
    { number: '10.1.5', name: '10.1.5', seasonName: 'Season 1' },
    { number: '10.1.7', name: '10.1.7', seasonName: 'Season 1' },
    { number: '10.2.0', name: '10.2.0', seasonName: 'Season 1' },
    { number: '10.2.5', name: '10.2.5', seasonName: 'Season 1' },
    { number: '10.2.7', name: '10.2.7', seasonName: 'Season 1' },
  ],
  TWW: [
    { number: '11.0.0', name: '11.0.0', seasonName: 'Season 1' },
    { number: '11.0.2', name: '11.0.2', seasonName: 'Season 1' },
    { number: '11.0.5', name: '11.0.5', seasonName: 'Season 1' },
  ],
  MIDNIGHT: [
    { number: '12.0.0', name: '12.0.0', seasonName: 'Season 1' },
    { number: '12.0.2', name: '12.0.2', seasonName: 'Season 1' },
    { number: '12.0.5', name: '12.0.5', seasonName: 'Season 1' },
  ],
};

export async function seedPatches(
  expansionRepo: ExpansionRepository,
  patchRepo: PatchRepository,
  seasonRepo?: Repository<Season>,
): Promise<void> {
  const allExpansions = await expansionRepo.findAll();

  // Build a lookup: expansionShortName -> seasons by name
  const allSeasons = seasonRepo ? await seasonRepo.find() : [];
  const seasonByExpansionAndName = new Map<string, Season>();
  for (const s of allSeasons) {
    seasonByExpansionAndName.set(`${s.expansionId}-${s.name}`, s);
  }

  for (const exp of allExpansions) {
    const patchConfigs = patchesByExpansion[exp.shortName];
    if (!patchConfigs) continue;

    const existingPatches = await patchRepo.findByExpansionId(exp.id);
    const existingPatchNumbers = new Set(existingPatches.map((p) => p.patchNumber));

    for (const cfg of patchConfigs) {
      if (existingPatchNumbers.has(cfg.number)) continue;

      // Find matching season for this patch
      let seasonId: string | undefined;
      if (seasonRepo) {
        const seasonKey = `${exp.id}-${cfg.seasonName}`;
        const season = seasonByExpansionAndName.get(seasonKey);
        if (season) {
          seasonId = season.id;
        }
      }

      const data: Partial<Patch> = {
        patchNumber: cfg.number,
        name: cfg.name,
        expansionId: exp.id,
        seasonId,
      };

      await patchRepo.create(data);
      console.log(
        `  ✓ Seeded patch ${cfg.number} for ${exp.shortName} (season: ${cfg.seasonName})`,
      );
    }
  }
}
