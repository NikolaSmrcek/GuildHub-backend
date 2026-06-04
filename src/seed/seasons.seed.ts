import { Repository } from 'typeorm';
import { Season } from '../modules/season/season.entity';

interface SeasonData {
  name: string;
  expansionShortName: string;
}

const seasons: SeasonData[] = [
  { name: 'Season 1', expansionShortName: 'CLASSIC' },
  { name: 'Season 2', expansionShortName: 'CLASSIC' },
  { name: 'Season 1', expansionShortName: 'TBC' },
  { name: 'Season 1', expansionShortName: 'WOTLK' },
  { name: 'Season 1', expansionShortName: 'CATA' },
  { name: 'Season 1', expansionShortName: 'MOP' },
  { name: 'Season 1', expansionShortName: 'WOD' },
  { name: 'Season 1', expansionShortName: 'LEGION' },
  { name: 'Season 1', expansionShortName: 'BFA' },
  { name: 'Season 1', expansionShortName: 'SL' },
  { name: 'Season 1', expansionShortName: 'DF' },
  { name: 'Season 1', expansionShortName: 'TWW' },
  { name: 'Season 1', expansionShortName: 'MIDNIGHT' },
];

export async function seedSeasons(
  seasonRepo: Repository<Season>,
  expansionIdByShortName: Record<string, string>,
): Promise<Season[]> {
  const existing = await seasonRepo.find();
  const existingNames = new Set(existing.map((s) => s.name));

  const created: Season[] = [];

  for (const s of seasons) {
    const key = `${s.name}-${s.expansionShortName}`;
    if (!existingNames.has(key)) {
      const season = await seasonRepo.save(
        seasonRepo.create({
          name: s.name,
          expansionId: expansionIdByShortName[s.expansionShortName],
        }),
      );
      console.log(`  ✓ Seeded season: ${s.name} for ${s.expansionShortName}`);
      created.push(season);
    }
  }

  return created;
}
