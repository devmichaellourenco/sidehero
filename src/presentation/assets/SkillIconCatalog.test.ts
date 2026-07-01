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
    expect(getSkillIconPath('mana_shield')).toBe(ASSETS.skills.mana_shield);
    expect(getSkillIconPath('iron_skin')).toBe(ASSETS.skills.iron_skin);
    expect(getSkillIconPath('blessing')).toBe(ASSETS.skills.blessing);
    expect(getSkillIconPath('thrust')).toBe(ASSETS.skills.thrust);
    expect(getSkillIconPath('shield_bash')).toBe(ASSETS.skills.attack);
    expect(getSkillIconPath('reaver_cleave')).toBe(ASSETS.skills.power_attack);
    expect(getSkillIconPath('reaver_fury')).toBe(ASSETS.skills.power_attack);
    expect(getSkillIconPath('guardian_strike')).toBe(ASSETS.skills.power_attack);
    expect(getSkillIconPath('goblin_stab')).toBe(ASSETS.skills.thrust);
  });

  it('resolve nome amigável para tooltip', () => {
    expect(getSkillDisplayName('basic_attack')).toBe('Ataque Básico');
    expect(getSkillDisplayName('dragon_breath')).toBe('Baforada');
  });
});
