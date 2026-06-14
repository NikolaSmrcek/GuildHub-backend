import { Injectable } from '@nestjs/common';
import { GuildHubLogger } from '../../shared/logger';

@Injectable()
export class LootService {
  private readonly logger = new GuildHubLogger(LootService.name);

  private items = new Map<string, Record<string, unknown>>();

  createItem(payload: Record<string, unknown>) {
    const id = typeof payload.id === 'string' ? payload.id : `item-${Date.now()}`;
    const item = { id, ...payload };
    this.items.set(id, item);
    return item;
  }

  getItem(id: string) {
    return this.items.get(id) || null;
  }

  getRaidItemCatalog() {
    return {
      'Castle Nathria': {
        Shriekwing: {
          LFR: {
            items: [
              {
                id: 'item-1',
                name: 'Sanguine Crossblade',
                ilvl: 449,
                sourcePatch: '12.0.5',
                playersPriority: [
                  { id: 'player-1', displayName: 'Valena', role: 'healer', priority: 'main' },
                  { id: 'player-2', displayName: 'Brox', role: 'tank', priority: 'offspec' },
                ],
              },
            ],
          },
          Normal: {
            items: [
              {
                id: 'item-2',
                name: 'Rondel of the Deadly Hallows',
                ilvl: 452,
                sourcePatch: '12.0.5',
                playersPriority: [
                  { id: 'player-3', displayName: 'Arya', role: 'damage', priority: 'main' },
                ],
              },
            ],
          },
          Heroic: {
            items: [
              {
                id: 'item-3',
                name: 'Bloodspattered Sabatons',
                ilvl: 455,
                sourcePatch: '12.0.5',
                playersPriority: [
                  { id: 'player-4', displayName: 'Joren', role: 'tank', priority: 'main' },
                ],
              },
            ],
          },
          Mythic: {
            items: [
              {
                id: 'item-4',
                name: 'Sharpfang Greatsword',
                ilvl: 458,
                sourcePatch: '12.0.5',
                playersPriority: [
                  { id: 'player-5', displayName: 'Seris', role: 'damage', priority: 'main' },
                ],
              },
            ],
          },
        },
        HuntsmanAltimor: {
          LFR: {
            items: [
              {
                id: 'item-5',
                name: 'Barbed Deathblow',
                ilvl: 448,
                sourcePatch: '12.0.5',
                playersPriority: [
                  { id: 'player-2', displayName: 'Brox', role: 'tank', priority: 'main' },
                ],
              },
            ],
          },
        },
      },
    };
  }
}
