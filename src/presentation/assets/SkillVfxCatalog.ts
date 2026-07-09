export type SkillVfxMotion = 'projectile' | 'melee' | 'aoe' | 'self';

export interface SkillVfxDefinition {
  skillId: string;
  motion: SkillVfxMotion;
  durationMs: number;
  width: number;
  height: number;
}

const SKILL_VFX_BY_ID: Record<string, SkillVfxDefinition> = {
  fireball: {
    skillId: 'fireball',
    motion: 'projectile',
    durationMs: 520,
    width: 148,
    height: 74,
  },
};

export function getSkillVfxDefinition(skillId: string): SkillVfxDefinition | null {
  return SKILL_VFX_BY_ID[skillId] ?? null;
}

/** SVG animado em `public/sprites/skills/svg/{skillId}.svg` → `panel/assets/skills/svg/`. */
export function getSkillVfxSvgPath(skillId: string): string {
  return `skills/svg/${skillId}.svg`;
}

export function listSkillVfxIds(): string[] {
  return Object.keys(SKILL_VFX_BY_ID);
}
