import { describe, expect, it } from 'vitest';
import {
  HERO_LEVEL_UP_ATTACK_GAIN,
  HERO_LEVEL_UP_DEFENSE_GAIN,
  HERO_LEVEL_UP_HEALTH_GAIN,
} from '../balance/ProgressionPowerScale';
import { buildEnemyCombatSheet } from './EnemyProgressionCatalog';

describe('buildEnemyCombatSheet', () => {
  it('escala attrs e bases com o level', () => {
    const early = buildEnemyCombatSheet({
      enemyType: 'goblin_raider',
      level: 1,
      role: 'trash',
    });
    const late = buildEnemyCombatSheet({
      enemyType: 'goblin_raider',
      level: 9,
      role: 'trash',
    });

    expect(late.attributes.str).toBeGreaterThan(early.attributes.str);
    expect(late.baseAttack).toBe(
      early.baseAttack + 8 * HERO_LEVEL_UP_ATTACK_GAIN,
    );
    expect(late.baseDefense).toBe(
      early.baseDefense + 8 * HERO_LEVEL_UP_DEFENSE_GAIN,
    );
    expect(late.baseMaxHealth).toBe(
      early.baseMaxHealth + 8 * HERO_LEVEL_UP_HEALTH_GAIN,
    );
  });

  it('role boss aumenta bases em relação a trash no mesmo level', () => {
    const trash = buildEnemyCombatSheet({
      enemyType: 'hill_ogre',
      level: 5,
      role: 'trash',
    });
    const boss = buildEnemyCombatSheet({
      enemyType: 'hill_ogre',
      level: 5,
      role: 'boss',
    });

    expect(boss.baseAttack).toBeGreaterThan(trash.baseAttack);
    expect(boss.baseMaxHealth).toBeGreaterThan(trash.baseMaxHealth);
  });

  it('propaga passiveIds do roster', () => {
    const sheet = buildEnemyCombatSheet({
      enemyType: 'hill_ogre',
      level: 1,
      role: 'boss',
    });
    expect(sheet.passiveIds).toContain('titan_health');
  });

  it('rank de skill sobe a cada 8 levels', () => {
    const early = buildEnemyCombatSheet({
      enemyType: 'goblin_raider',
      level: 1,
      role: 'trash',
    });
    const mid = buildEnemyCombatSheet({
      enemyType: 'goblin_raider',
      level: 9,
      role: 'trash',
    });

    expect(early.skillRanks.goblin_stab).toBe(1);
    expect(mid.skillRanks.goblin_stab).toBe(2);
  });
});
