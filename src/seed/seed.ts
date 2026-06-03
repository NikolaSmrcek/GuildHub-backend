import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../app.module';
import { ExpansionRepository } from '../modules/expansion/expansion.repository';
import { PatchRepository } from '../modules/patch/patch.repository';

async function seedExpansions(
  expansionRepo: ExpansionRepository,
  patchRepo: PatchRepository,
): Promise<void> {
  const expansions = [
    { name: 'Classic', shortName: 'CLASSIC', releaseDate: new Date('2004-11-23') },
    { name: 'The Burning Crusade', shortName: 'TBC', releaseDate: new Date('2007-01-16') },
    { name: 'Wrath of the Lich King', shortName: 'WOTLK', releaseDate: new Date('2008-11-13') },
    { name: 'Cataclysm', shortName: 'CATA', releaseDate: new Date('2010-12-07') },
    { name: 'Mists of Pandaria', shortName: 'MOP', releaseDate: new Date('2012-09-25') },
    { name: 'Warlords of Draenor', shortName: 'WOD', releaseDate: new Date('2014-11-13') },
    { name: 'Legion', shortName: 'LEGION', releaseDate: new Date('2016-08-30') },
    { name: 'Battle for Azeroth', shortName: 'BFA', releaseDate: new Date('2018-08-14') },
    { name: 'Shadowlands', shortName: 'SL', releaseDate: new Date('2020-11-23') },
    { name: 'Dragonflight', shortName: 'DF', releaseDate: new Date('2022-11-28') },
    { name: 'The War Within', shortName: 'TWW', releaseDate: new Date('2024-08-26') },
    { name: 'Midnight', shortName: 'MIDNIGHT', releaseDate: new Date('2025-06-30') },
  ];

  const existing = await expansionRepo.findAll();
  const existingNames = new Set(existing.map((e) => e.name));
  for (const exp of expansions) {
    if (!existingNames.has(exp.name)) {
      await expansionRepo.create(exp);
    }
  }

  const allExpansions = await expansionRepo.findAll();
  for (const exp of allExpansions) {
    const patches = getPatchesForExpansion(exp.shortName);
    const existingPatches = await patchRepo.findByExpansionId(exp.id);
    const existingPatchNames = new Set(existingPatches.map((p) => p.name));
    for (const patchName of patches) {
      if (!existingPatchNames.has(patchName)) {
        await patchRepo.create({ name: patchName, expansionId: exp.id });
      }
    }
  }
}

function getPatchesForExpansion(shortName: string): string[] {
  const patches: Record<string, string[]> = {
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
  return patches[shortName] || [];
}

async function bootstrapSeed() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const expansionRepo = app.get(ExpansionRepository);
  const patchRepo = app.get(PatchRepository);
  await seedExpansions(expansionRepo, patchRepo);
  await app.close();
  console.log('Seeding completed successfully.');
}

bootstrapSeed();
