import { Experience } from '../../domain/value-objects/Experience';
import { Stats } from '../../domain/value-objects/Stats';
import { Gear, GearSlot } from '../../domain/entities/Gear';
import { Hero, HeroProps } from '../../domain/entities/Hero';
import { Enemy, EnemyProps } from '../../domain/entities/Enemy';
import { Chest, ChestProps } from '../../domain/entities/Chest';

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value !== null && typeof value === 'object' ? (value as RawRecord) : {};
}

function migrateEquipment(raw: unknown): HeroProps['equipment'] {
  const entries = Object.entries(asRecord(raw));
  return Object.fromEntries(
    entries.map(([slot, gear]) => [
      slot as GearSlot,
      gear && typeof gear === 'object' ? Gear.create(gear as Parameters<typeof Gear.create>[0]) : null,
    ]),
  );
}

function migrateExperience(raw: unknown): Experience {
  const exp = asRecord(raw);
  return Experience.restore(
    typeof exp.current === 'number' ? exp.current : 0,
    typeof exp.toNextLevel === 'number' ? exp.toNextLevel : 100,
    typeof exp.level === 'number' ? exp.level : 1,
  );
}

export function migrateHero(raw: unknown): Hero {
  const h = asRecord(raw);

  if (typeof h.id !== 'string' || typeof h.name !== 'string' || typeof h.heroClass !== 'string') {
    throw new Error('Herói inválido no storage');
  }

  const experience = migrateExperience(h.experience);
  const equipment = migrateEquipment(h.equipment);

  if (typeof h.baseAttack === 'number') {
    return Hero.restore({
      id: h.id,
      name: h.name,
      heroClass: h.heroClass as HeroProps['heroClass'],
      baseAttack: h.baseAttack,
      baseDefense: typeof h.baseDefense === 'number' ? h.baseDefense : 5,
      baseMaxHealth: typeof h.baseMaxHealth === 'number' ? h.baseMaxHealth : 100,
      currentHealth: typeof h.currentHealth === 'number' ? h.currentHealth : 100,
      experience,
      equipment,
    });
  }

  const stats = asRecord(h.stats);
  return Hero.restore({
    id: h.id,
    name: h.name,
    heroClass: h.heroClass as HeroProps['heroClass'],
    baseAttack: typeof stats.attack === 'number' ? stats.attack : 10,
    baseDefense: typeof stats.defense === 'number' ? stats.defense : 5,
    baseMaxHealth: typeof stats.maxHealth === 'number' ? stats.maxHealth : 100,
    currentHealth:
      typeof stats.currentHealth === 'number'
        ? stats.currentHealth
        : typeof stats.maxHealth === 'number'
          ? stats.maxHealth
          : 100,
    experience,
    equipment,
  });
}

export function migrateEnemy(raw: unknown): Enemy | null {
  if (!raw || typeof raw !== 'object') return null;

  const e = raw as EnemyProps;
  const statsRaw = asRecord(e.stats);

  return Enemy.restore({
    id: e.id,
    name: e.name,
    stage: e.stage,
    stats: Stats.create({
      attack: typeof statsRaw.attack === 'number' ? statsRaw.attack : 10,
      defense: typeof statsRaw.defense === 'number' ? statsRaw.defense : 4,
      maxHealth: typeof statsRaw.maxHealth === 'number' ? statsRaw.maxHealth : 60,
      currentHealth:
        typeof statsRaw.currentHealth === 'number'
          ? statsRaw.currentHealth
          : typeof statsRaw.maxHealth === 'number'
            ? statsRaw.maxHealth
            : 60,
    }),
    goldReward: e.goldReward,
    xpReward: e.xpReward,
  });
}

export function migrateChest(raw: unknown): Chest {
  const c = raw as ChestProps;
  return Chest.restore({
    id: c.id,
    stageEarned: c.stageEarned,
    opened: Boolean(c.opened),
    loot: c.loot && typeof c.loot === 'object' ? Gear.create(c.loot) : null,
  });
}

export function migrateGear(raw: unknown): Gear {
  return Gear.create(raw as Parameters<typeof Gear.create>[0]);
}
