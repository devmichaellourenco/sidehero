import { getEnemySkillDisplay } from '../../domain/progression/combat/EnemySkillDisplayCatalog';
import { getSkillById } from '../../domain/progression/SkillCatalog';
import { ASSETS, getAssetUrl } from './AssetCatalog';

type SkillIconKey = keyof typeof ASSETS.skills;

const SKILL_ICON_BY_ID: Record<string, SkillIconKey> = {
  basic_attack: 'attack',
  power_attack: 'physical',
  shield_bash: 'weapon',
  reaver_cleave: 'attack',
  reaver_fury: 'attack',
  guardian_strike: 'weapon',
  goblin_stab: 'attack',
  orc_smash: 'attack',
  dragon_bite: 'attack',

  fireball: 'magic',
  arcane_bolt: 'magic',
  smite: 'magic',
  arcane_touch: 'magic',
  pyro_inferno: 'magic',
  pyro_ember: 'magic',
  arcane_surge: 'magic',
  arcane_focus: 'magic',
  inquisitor_judgment: 'magic',
  inquisitor_flame: 'magic',
  slime_acid: 'magic',
  wraith_drain: 'magic',
  dragon_breath: 'magic',

  minor_heal: 'heal',
  oracle_mend: 'heal',
  oracle_sanctuary: 'heal',
  guardian_resolve: 'heal',

  blessing: 'buff',
  wraith_curse: 'debuff',
};

export function getSkillIconPath(skillId: string): string {
  const key = SKILL_ICON_BY_ID[skillId] ?? 'magic';
  return ASSETS.skills[key];
}

export function getSkillIconUrl(skillId: string): string {
  return getAssetUrl(getSkillIconPath(skillId));
}

export function getSkillDisplayName(skillId: string, fallbackName?: string): string {
  return (
    getSkillById(skillId)?.name ??
    getEnemySkillDisplay(skillId)?.name ??
    fallbackName ??
    skillId
  );
}
