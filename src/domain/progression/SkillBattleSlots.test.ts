import { describe, expect, it } from 'vitest';
import {
  BASE_UNLOCKED_BATTLE_SKILL_SLOTS,
  getUnlockedBattleSkillSlotCount,
  hasFreeBattleSkillSlot,
  trimEquippedSkillIds,
} from './SkillBattleSlots';

describe('SkillBattleSlots', () => {
  it('inicia com 1 slot desbloqueado sem upgrades', () => {
    expect(getUnlockedBattleSkillSlotCount({})).toBe(BASE_UNLOCKED_BATTLE_SKILL_SLOTS);
  });

  it('desbloqueia slots extras via melhoria battle_skill_slots', () => {
    expect(getUnlockedBattleSkillSlotCount({ battle_skill_slots: 1 })).toBe(2);
    expect(getUnlockedBattleSkillSlotCount({ battle_skill_slots: 2 })).toBe(3);
  });

  it('respeita limite de slots livres conforme desbloqueio', () => {
    expect(hasFreeBattleSkillSlot(['basic_attack'], 1)).toBe(false);
    expect(hasFreeBattleSkillSlot(['basic_attack'], 2)).toBe(true);
  });

  it('mantém ataque básico ao aparar skills equipadas', () => {
    expect(
      trimEquippedSkillIds(['basic_attack', 'power_attack', 'evasion'], 1),
    ).toEqual(['basic_attack']);
  });
});
