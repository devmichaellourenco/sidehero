import { describe, expect, it } from 'vitest';
import { ASSETS } from './AssetCatalog';
import { getSkillIconPath, getSkillDisplayName } from './SkillIconCatalog';

describe('SkillIconCatalog', () => {
  it('mapeia skills de ataque e cura para ícones existentes', () => {
    expect(getSkillIconPath('basic_attack')).toBe(ASSETS.skills.attack);
    expect(getSkillIconPath('fireball')).toBe(ASSETS.skills.magic);
    expect(getSkillIconPath('minor_heal')).toBe(ASSETS.skills.heal);
  });

  it('resolve nome amigável para tooltip', () => {
    expect(getSkillDisplayName('basic_attack')).toBe('Ataque Básico');
    expect(getSkillDisplayName('dragon_breath')).toBe('Baforada');
  });
});
