import { Injectable } from '@nestjs/common';

@Injectable()
export class LootService {
  private items = new Map<string, any>();

  createItem(payload: any) {
    const id = payload.id || `item-${Date.now()}`;
    const item = { id, ...payload };
    this.items.set(id, item);
    return item;
  }

  getItem(id: string) {
    return this.items.get(id) || null;
  }
}
