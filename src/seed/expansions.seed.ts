import { ExpansionRepository } from '../modules/expansion/expansion.repository';

const expansions = [
  { name: 'Classic', shortName: 'CLASSIC', releaseDate: '2004-11-23' },
  { name: 'The Burning Crusade', shortName: 'TBC', releaseDate: '2007-01-16' },
  { name: 'Wrath of the Lich King', shortName: 'WOTLK', releaseDate: '2008-11-13' },
  { name: 'Cataclysm', shortName: 'CATA', releaseDate: '2010-12-07' },
  { name: 'Mists of Pandaria', shortName: 'MOP', releaseDate: '2012-09-25' },
  { name: 'Warlords of Draenor', shortName: 'WOD', releaseDate: '2014-11-13' },
  { name: 'Legion', shortName: 'LEGION', releaseDate: '2016-08-30' },
  { name: 'Battle for Azeroth', shortName: 'BFA', releaseDate: '2018-08-14' },
  { name: 'Shadowlands', shortName: 'SL', releaseDate: '2020-11-23' },
  { name: 'Dragonflight', shortName: 'DF', releaseDate: '2022-11-28' },
  { name: 'The War Within', shortName: 'TWW', releaseDate: '2024-08-26' },
  { name: 'Midnight', shortName: 'MIDNIGHT', releaseDate: '2025-06-30' },
];

export async function seedExpansions(repo: ExpansionRepository): Promise<void> {
  const existing = await repo.findAll();
  const existingNames = new Set(existing.map((e) => e.name));

  for (const exp of expansions) {
    if (!existingNames.has(exp.name)) {
      await repo.create(exp);
      console.log(`  ✓ Seeded expansion: ${exp.name}`);
    }
  }
}
