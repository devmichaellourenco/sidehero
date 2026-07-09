import { describe, expect, it } from 'vitest';
import {
  getSkillVfxDefinition,
  getSkillVfxSvgPath,
  listSkillVfxIds,
} from './SkillVfxCatalog';

describe('SkillVfxCatalog', () => {
  it('registra fireball com SVG dedicado', () => {
    expect(listSkillVfxIds()).toContain('fireball');
    expect(getSkillVfxDefinition('fireball')?.motion).toBe('projectile');
    expect(getSkillVfxSvgPath('fireball')).toBe('skills/svg/fireball.svg');
  });

  it('retorna null para skills sem VFX', () => {
    expect(getSkillVfxDefinition('arcane_bolt')).toBeNull();
  });
});
