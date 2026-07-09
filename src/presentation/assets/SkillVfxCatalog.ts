export type SkillVfxMotion = 'projectile' | 'melee' | 'aoe' | 'self';

export interface SkillVfxImpactDefinition {
  durationMs: number;
  width: number;
  height: number;
  /** Atraso antes do impacto; padrão = duração do projétil. */
  delayMs?: number;
  /** Arquivo em `public/sprites/skills/svg/`; padrão = `impact_{skillId}.svg`. */
  svgFile?: string;
}

export interface SkillVfxDefinition {
  skillId: string;
  motion: SkillVfxMotion;
  durationMs: number;
  width: number;
  height: number;
  /** Arquivo em `public/sprites/skills/svg/`; padrão = `{skillId}.svg`. */
  svgFile?: string;
  /** Rotação do SVG (ex.: raio vertical → projétil horizontal). */
  rotationDeg?: number;
  glow?: 'fire' | 'lightning' | 'heal' | 'slash' | 'cold';
  /** Onde ancorar efeitos; `target_column` = coluna do topo da strip até o chão no alvo. */
  placement?: 'caster' | 'target' | 'target_column';
  /** Proporção largura/altura da coluna quando `placement: 'target_column'`. */
  columnAspectRatio?: number;
  /** Enquadramento do SVG dentro do `<object>` (ex.: coluna de nevasca). */
  svgObjectPosition?: string;
  impact?: SkillVfxImpactDefinition;
}

const HEAL_VFX: SkillVfxDefinition = {
  skillId: 'minor_heal',
  motion: 'self',
  svgFile: 'heal.svg',
  placement: 'target',
  durationMs: 760,
  width: 108,
  height: 162,
  glow: 'heal',
};

const SKILL_VFX_BY_ID: Record<string, SkillVfxDefinition> = {
  basic_attack: {
    skillId: 'basic_attack',
    motion: 'melee',
    svgFile: 'basic_attack.svg',
    placement: 'target',
    durationMs: 380,
    width: 176,
    height: 99,
    glow: 'slash',
  },
  fireball: {
    skillId: 'fireball',
    motion: 'projectile',
    durationMs: 520,
    width: 148,
    height: 74,
    glow: 'fire',
    impact: {
      durationMs: 580,
      width: 132,
      height: 132,
    },
  },
  arcane_bolt: {
    skillId: 'arcane_bolt',
    motion: 'projectile',
    svgFile: 'thunder_bolt.svg',
    rotationDeg: -90,
    durationMs: 400,
    width: 64,
    height: 136,
    glow: 'lightning',
  },
  minor_heal: HEAL_VFX,
  blizzard: {
    skillId: 'blizzard',
    motion: 'aoe',
    svgFile: 'blizzard.svg',
    placement: 'target_column',
    columnAspectRatio: 800 / 600,
    svgObjectPosition: '58% 100%',
    durationMs: 1400,
    width: 170,
    height: 128,
    glow: 'cold',
  },
};

const SKILL_VFX_ALIASES: Record<string, string> = {
  oracle_mend: 'minor_heal',
};

export function getSkillVfxDefinition(skillId: string): SkillVfxDefinition | null {
  const baseId = SKILL_VFX_ALIASES[skillId] ?? skillId;
  const definition = SKILL_VFX_BY_ID[baseId];
  if (!definition) return null;
  if (skillId === baseId) return definition;
  return { ...definition, skillId };
}

/** SVG animado em `public/sprites/skills/svg/{skillId}.svg` → `panel/assets/skills/svg/`. */
export function getSkillVfxSvgPath(skillId: string, svgFile?: string): string {
  return `skills/svg/${svgFile ?? `${skillId}.svg`}`;
}

/** Impacto em `public/sprites/skills/svg/impact_{skillId}.svg` (ou nome custom no catálogo). */
export function getSkillVfxImpactSvgPath(
  skillId: string,
  impact?: SkillVfxImpactDefinition,
): string | null {
  if (!impact) return null;
  const file = impact.svgFile ?? `impact_${skillId}.svg`;
  return `skills/svg/${file}`;
}

export function listSkillVfxIds(): string[] {
  return Object.keys(SKILL_VFX_BY_ID);
}
