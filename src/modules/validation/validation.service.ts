import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Race } from '../character/race.entity';
import { RaceClass } from '../character/race-class.entity';
import { ClassSpec } from '../character/class-spec.entity';
import { ClassArmor } from '../character/class-armor.entity';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

@Injectable()
export class ValidationService implements OnApplicationBootstrap {
  private readonly raceClassMap = new Map<string, Set<string>>();
  private readonly classSpecMap = new Map<string, Set<string>>();
  private readonly classArmorMap = new Map<string, string>();
  private readonly armorSubclasses = new Set(['Cloth', 'Leather', 'Mail', 'Plate']);
  private loaded = false;

  constructor(
    @InjectRepository(Race)
    private readonly raceRepo: Repository<Race>,
    @InjectRepository(RaceClass)
    private readonly raceClassRepo: Repository<RaceClass>,
    @InjectRepository(ClassSpec)
    private readonly classSpecRepo: Repository<ClassSpec>,
    @InjectRepository(ClassArmor)
    private readonly classArmorRepo: Repository<ClassArmor>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.loadMaps();
  }

  async loadMaps(): Promise<void> {
    await Promise.all([this.loadRaceClasses(), this.loadClassSpecs(), this.loadClassArmor()]);
    this.loaded = true;
  }

  // ──── Race ↔ Class ─────────────────────────────────────

  private async loadRaceClasses(): Promise<void> {
    this.raceClassMap.clear();
    const rows = await this.raceClassRepo.find({ relations: { race: true } });
    for (const rc of rows) {
      const set = this.raceClassMap.get(rc.race.name) ?? new Set();
      set.add(rc.className);
      this.raceClassMap.set(rc.race.name, set);
    }
  }

  validateRaceClass(race: string, className: string): boolean {
    if (race === 'Dracthyr') {
      // Dracthyr exists as two rows (Alliance + Horde) — merge their class sets
      const alliance = this.raceClassMap.get('Dracthyr') ?? new Set();
      return alliance.has(className);
    }
    const allowedClasses = this.raceClassMap.get(race);
    return allowedClasses?.has(className) ?? false;
  }

  // ──── Class ↔ Spec ─────────────────────────────────────

  private async loadClassSpecs(): Promise<void> {
    this.classSpecMap.clear();
    const rows = await this.classSpecRepo.find();
    for (const cs of rows) {
      const set = this.classSpecMap.get(cs.className) ?? new Set();
      set.add(cs.specName);
      this.classSpecMap.set(cs.className, set);
    }
  }

  validateClassSpec(className: string, spec: string): boolean {
    const specsForClass = this.classSpecMap.get(className);
    return specsForClass?.has(spec) ?? false;
  }

  // ──── Class ↔ Armor ────────────────────────────────────

  private async loadClassArmor(): Promise<void> {
    this.classArmorMap.clear();
    const rows = await this.classArmorRepo.find();
    for (const ca of rows) {
      this.classArmorMap.set(ca.className, ca.armorSubclass);
    }
  }

  validateClassArmor(className: string, armorSubclass: string): boolean {
    // Non-armor items (weapons, trinkets, etc.) pass through
    if (!this.armorSubclasses.has(armorSubclass)) {
      return true;
    }
    // Tier tokens and other special subclasses pass through
    if (!this.armorSubclasses.has(armorSubclass)) {
      return true;
    }
    const expectedArmor = this.classArmorMap.get(className);
    return expectedArmor === armorSubclass;
  }

  // ──── Composite ────────────────────────────────────────

  validateCharacterCombination(race: string, className: string, spec: string): ValidationResult {
    const errors: string[] = [];

    if (!race) {
      errors.push('Race is required');
    } else if (!this.validateRaceClass(race, className)) {
      errors.push(`Race "${race}" cannot be class "${className}"`);
    }

    if (className && spec && !this.validateClassSpec(className, spec)) {
      errors.push(`Class "${className}" has no spec "${spec}"`);
    }

    return { valid: errors.length === 0, errors };
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}
