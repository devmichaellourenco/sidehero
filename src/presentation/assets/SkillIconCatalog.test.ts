import { describe, expect, it } from 'vitest';
import { ASSETS } from './AssetCatalog';
import { getSkillIconPath, getSkillDisplayName } from './SkillIconCatalog';

describe('SkillIconCatalog', () => {
  it('mapeia skills para ícones dedicados ou placeholders', () => {
    expect(getSkillIconPath('basic_attack')).toBe(ASSETS.skills.attack);
    expect(getSkillIconPath('fireball')).toBe(ASSETS.skills.fireball);
    expect(getSkillIconPath('arcane_bolt')).toBe(ASSETS.skills.arcane_bolt);
    expect(getSkillIconPath('vitality')).toBe(ASSETS.skills.vitality);
    expect(getSkillIconPath('minor_heal')).toBe(ASSETS.skills.heal);
  });

  it('resolve nome amigável para tooltip', () => {
    expect(getSkillDisplayName('basic_attack')).toBe('Ataque Básico');
    expect(getSkillDisplayName('dragon_breath')).toBe('Baforada');
  });
});
