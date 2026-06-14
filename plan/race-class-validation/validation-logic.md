# Race / Class Validation — Validation Logic

## Design

Validation functions live in `ValidationService` (`src/modules/validation/validation.service.ts`). They are **internal-only** — called by other services (RaidbotsService, future CharacterService) and seed scripts, but never exposed via a controller.

The service uses **in-memory maps** for fast lookups without DB queries during validation. The maps are loaded once via `OnApplicationBootstrap` or constructor from the reference tables.

---

## Validation Functions

### 1. `validateRaceClass(race: string, className: string): boolean`

Checks whether a given race can play a given class.

```ts
validateRaceClass(race: string, className: string): boolean {
  const allowedClasses = this.raceClassMap.get(race);
  return allowedClasses?.has(className) ?? false;
}
```

**Examples:**
- `validateRaceClass('Human', 'Paladin')` → `true`
- `validateRaceClass('Human', 'Shaman')` → `false`
- `validateRaceClass('Night Elf', 'Demon Hunter')` → `true`
- `validateRaceClass('Orc', 'Demon Hunter')` → `false`

### 2. `validateClassSpec(className: string, spec: string): boolean`

Checks whether a spec belongs to a class. Note: some spec names repeat across classes (e.g., "Holy" for both Priest and Paladin).

```ts
validateClassSpec(className: string, spec: string): boolean {
  const specsForClass = this.classSpecMap.get(className);
  return specsForClass?.has(spec) ?? false;
}
```

**Examples:**
- `validateClassSpec('Priest', 'Holy')` → `true`
- `validateClassSpec('Paladin', 'Holy')` → `true`
- `validateClassSpec('Warrior', 'Holy')` → `false`
- `validateClassSpec('Druid', 'Balance')` → `true`

### 3. `validateClassArmor(className: string, armorSubclass: string): boolean`

Checks whether an item's armor type matches the character's class primary armor. Only validates ARMOR items — weapon subclasses (Sword, Dagger, etc.) are skipped (return `true`).

```ts
validateClassArmor(className: string, armorSubclass: string): boolean {
  // Weapons and other non-armor items pass through
  if (!this.armorSubclasses.has(armorSubclass)) {
    return true;
  }
  const expectedArmor = this.classArmorMap.get(className);
  return expectedArmor === armorSubclass;
}
```

**Examples:**
- `validateClassArmor('Mage', 'Cloth')` → `true`
- `validateClassArmor('Mage', 'Plate')` → `false`
- `validateClassArmor('Warrior', 'Sword')` → `true` (weapon — no restriction)
- `validateClassArmor('Paladin', 'Cloth')` → `false`

### 4. `validateCharacterCombination(race: string, className: string, spec: string): Result`

Runs all three checks at once, returning a structured result:

```ts
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

validateCharacterCombination(race: string, className: string, spec: string): ValidationResult {
  const errors: string[] = [];

  if (!this.validateRaceClass(race, className)) {
    errors.push(`Race "${race}" cannot be class "${className}"`);
  }

  if (className && spec && !this.validateClassSpec(className, spec)) {
    errors.push(`Class "${className}" has no spec "${spec}"`);
  }

  if (!race) {
    errors.push('Race is required');
  }

  return { valid: errors.length === 0, errors };
}
```

---

## In-Memory Maps (Loaded at Startup)

```ts
@Injectable()
export class ValidationService implements OnApplicationBootstrap {
  // race → Set<class_name>
  private readonly raceClassMap = new Map<string, Set<string>>();

  // class_name → Set<spec_name>
  private readonly classSpecMap = new Map<string, Set<string>>();

  // class_name → armor_subclass
  private readonly classArmorMap = new Map<string, string>();

  // Set of valid armor subclasses
  private readonly armorSubclasses = new Set(['Cloth', 'Leather', 'Mail', 'Plate']);

  async onApplicationBootstrap(): Promise<void> {
    await this.loadRaceClasses();
    await this.loadClassSpecs();
    await this.loadClassArmor();
  }

  private async loadRaceClasses() {
    const rows = await this.raceClassRepo.find({ relations: { race: true } });
    for (const rc of rows) {
      const set = this.raceClassMap.get(rc.race.name) ?? new Set();
      set.add(rc.className);
      this.raceClassMap.set(rc.race.name, set);
    }
  }
  // ... similar for other maps
}
```

---

## Integration: RaidbotsService.createReport()

```ts
// After finding matchedItem, but before pushing to upgrades[]
if (!this.validationService.validateClassArmor(character.playerClass, matchedItem.subclass)) {
  this.logger.debug('Armor type mismatch — skipping item', {
    character: character.name,
    class: character.playerClass,
    item: matchedItem.name,
    itemSubclass: matchedItem.subclass,
  });
  continue; // skip this upgrade
}
```

This prevents e.g.:
- A Paladin (Plate) getting "Endless March Waistwrap" (Cloth) as a recommended upgrade
- A Druid (Leather) getting Mail items

The Raidbots sim already handles DPS calculation — but it doesn't know WoW armor rules. This adds that layer.

---

## Usage in Seeds

Seed scripts call `validateCharacterCombination()` before inserting a character. If validation fails, the seed logs a warning and skips that character.

```ts
// In more-characters.seed.ts
const validation = validationService.validateCharacterCombination(
  entry.race, entry.playerClass, entry.spec
);
if (!validation.valid) {
  console.warn(`  ⚠ Skipping invalid character "${entry.name}": ${validation.errors.join(', ')}`);
  continue;
}
```
