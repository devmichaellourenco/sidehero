import { describe, expect, it } from 'vitest';
import {
  getSkillVfxDefinition,
  getSkillVfxImpactSvgPath,
  getSkillVfxSvgPath,
  listSkillVfxIds,
} from './SkillVfxCatalog';

describe('SkillVfxCatalog', () => {
  it('registra basic_attack com basic_attack.svg no alvo', () => {
    const definition = getSkillVfxDefinition('basic_attack');
    expect(definition?.motion).toBe('melee');
    expect(definition?.svgFile).toBe('basic_attack.svg');
    expect(definition?.placement).toBe('target');
    expect(getSkillVfxSvgPath('basic_attack', definition?.svgFile)).toBe(
      'skills/svg/basic_attack.svg',
    );
  });

  it('registra fireball com SVG dedicado', () => {
    expect(listSkillVfxIds()).toContain('fireball');
    expect(getSkillVfxDefinition('fireball')?.motion).toBe('projectile');
    expect(getSkillVfxSvgPath('fireball')).toBe('skills/svg/fireball.svg');
  });

  it('registra impacto da fireball', () => {
    const impact = getSkillVfxDefinition('fireball')?.impact;
    expect(impact).toBeDefined();
    expect(getSkillVfxImpactSvgPath('fireball', impact!)).toBe('skills/svg/impact_fireball.svg');
  });

  it('registra arcane_bolt com thunder_bolt.svg', () => {
    const definition = getSkillVfxDefinition('arcane_bolt');
    expect(definition?.svgFile).toBe('thunder_bolt.svg');
    expect(definition?.rotationDeg).toBe(-90);
    expect(getSkillVfxSvgPath('arcane_bolt', definition?.svgFile)).toBe(
      'skills/svg/thunder_bolt.svg',
    );
  });

  it('registra minor_heal com heal.svg no alvo', () => {
    const definition = getSkillVfxDefinition('minor_heal');
    expect(definition?.svgFile).toBe('heal.svg');
    expect(definition?.placement).toBe('target');
    expect(definition?.glow).toBe('heal');
    expect(getSkillVfxSvgPath('minor_heal', definition?.svgFile)).toBe('skills/svg/heal.svg');
  });

  it('reutiliza VFX de cura em oracle_mend', () => {
    expect(getSkillVfxDefinition('oracle_mend')?.svgFile).toBe('heal.svg');
  });

  it('registra blizzard como coluna vertical com blizzard.svg', () => {
    const definition = getSkillVfxDefinition('blizzard');
    expect(definition?.motion).toBe('aoe');
    expect(definition?.svgFile).toBe('blizzard.svg');
    expect(definition?.placement).toBe('target_column');
    expect(definition?.columnAspectRatio).toBeCloseTo(800 / 600);
    expect(definition?.durationMs).toBe(1400);
    expect(definition?.glow).toBe('cold');
    expect(getSkillVfxSvgPath('blizzard', definition?.svgFile)).toBe('skills/svg/blizzard.svg');
  });

  it('retorna null para skills sem VFX', () => {
    expect(getSkillVfxDefinition('frost_shard')).toBeNull();
  });
});
