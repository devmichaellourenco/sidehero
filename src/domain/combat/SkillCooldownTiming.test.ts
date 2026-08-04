import { describe, expect, it } from 'vitest';
import {
  HERO_SKILL_COOLDOWN_TURN_SECONDS,
  MIN_SKILL_COOLDOWN_SECONDS,
  SKILL_COOLDOWN_SECONDS_PER_RANK,
} from './CombatTimingConstants';
import { getCooldownSeconds, getInitialCooldownSeconds } from './SkillCooldownTiming';
import { CombatSkillDefinition } from '../progression/combat/CombatSkillDefinition';

const EARLY_SKILL: CombatSkillDefinition = {
  skillId: 'arcane_bolt',
  kind: 'damage',
  targetPool: 'enemies',
  targetScope: 'single',
  targetPriority: 'lowest_hp_percent',
  usePriority: 80,
  initialCooldown: 0,
  cooldownTurns: 2,
  basePower: 1,
  powerPerRank: 4,
  attributeFactor: 1,
};

describe('SkillCooldownTiming — cadência herói', () => {
  it('skills iniciais (~2 turns) começam em ~10s', () => {
    expect(getCooldownSeconds(EARLY_SKILL)).toBe(2 * HERO_SKILL_COOLDOWN_TURN_SECONDS);
    expect(getCooldownSeconds(EARLY_SKILL)).toBe(10);
  });

  it('cada level reduz a recarga até o piso', () => {
    expect(getCooldownSeconds(EARLY_SKILL, { rank: 2 })).toBe(10 - SKILL_COOLDOWN_SECONDS_PER_RANK);
    expect(getCooldownSeconds(EARLY_SKILL, { rank: 3 })).toBe(10 - 2 * SKILL_COOLDOWN_SECONDS_PER_RANK);
    expect(getCooldownSeconds(EARLY_SKILL, { rank: 99 })).toBe(MIN_SKILL_COOLDOWN_SECONDS);
  });

  it('inimigos usam a mesma cadência dos heróis (BAL-013)', () => {
    expect(getCooldownSeconds(EARLY_SKILL, { forEnemy: true })).toBe(
      2 * HERO_SKILL_COOLDOWN_TURN_SECONDS,
    );
    expect(getInitialCooldownSeconds({ ...EARLY_SKILL, initialCooldown: 4 }, { forEnemy: true })).toBe(
      4 * HERO_SKILL_COOLDOWN_TURN_SECONDS,
    );
  });
});
