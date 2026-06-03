import { ExpansionRepository } from '../modules/expansion/expansion.repository';
import { PatchRepository } from '../modules/patch/patch.repository';

const patchesByExpansion: Record<string, string[]> = {
  CLASSIC: [
    '1.1.0',
    '1.2.0',
    '1.3.0',
    '1.4.0',
    '1.5.0',
    '1.6.0',
    '1.7.0',
    '1.8.0',
    '1.9.0',
    '1.10.0',
    '1.11.0',
    '1.12.0',
  ],
  TBC: ['2.0.1', '2.0.3', '2.1.0', '2.2.0', '2.3.0', '2.4.0'],
  WOTLK: ['3.0.2', '3.0.8', '3.1.0', '3.2.0', '3.3.0', '3.3.5'],
  CATA: ['4.0.1', '4.0.3', '4.0.6', '4.1.0', '4.2.0', '4.3.0'],
  MOP: ['5.0.4', '5.1.0', '5.2.0', '5.3.0', '5.4.0'],
  WOD: ['6.0.2', '6.0.3', '6.1.0', '6.2.0'],
  LEGION: ['7.0.3', '7.1.0', '7.1.5', '7.2.0', '7.2.5', '7.3.0', '7.3.5'],
  BFA: ['8.0.1', '8.1.0', '8.1.5', '8.2.0', '8.2.5', '8.3.0'],
  SL: ['9.0.1', '9.0.2', '9.0.5', '9.1.0', '9.1.5', '9.2.0', '9.2.5'],
  DF: [
    '10.0.0',
    '10.0.2',
    '10.0.5',
    '10.0.7',
    '10.1.0',
    '10.1.5',
    '10.1.7',
    '10.2.0',
    '10.2.5',
    '10.2.7',
  ],
  TWW: ['11.0.0', '11.0.2', '11.0.5'],
  MIDNIGHT: ['12.0.0', '12.0.2', '12.0.5'],
};

export async function seedPatches(
  expansionRepo: ExpansionRepository,
  patchRepo: PatchRepository,
): Promise<void> {
  const allExpansions = await expansionRepo.findAll();

  for (const exp of allExpansions) {
    const patchNames = patchesByExpansion[exp.shortName];
    if (!patchNames) continue;

    const existingPatches = await patchRepo.findByExpansionId(exp.id);
    const existingPatchValues = new Set(existingPatches.map((p) => p.patchNumber || p.name));

    for (const patchName of patchNames) {
      if (!existingPatchValues.has(patchName)) {
        await patchRepo.create({ patchNumber: patchName, name: patchName, expansionId: exp.id });
        console.log(`  ✓ Seeded patch ${patchName} for ${exp.shortName}`);
      }
    }
  }
}
