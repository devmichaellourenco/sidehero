import { Hero } from '../../domain/entities/Hero';
import { CombatSkillDefinition } from '../../domain/progression/combat/CombatSkillDefinition';
import { getHeroCombatSkill } from '../../domain/progression/combat/HeroCombatSkillCatalog';
import { SkillCombatKind } from '../../domain/progression/combat/SkillCombatKind';
import { SkillPowerCalculator } from '../../domain/progression/combat/SkillPowerCalculator';
import { HeroActiveSkillStatDto } from '../dto/GameStateDto';
import { SKILL_BRANCH_LABELS, SkillBranchDto, SkillScopeDto } from '../dto/SkillNodeDto';

const SCALING_LABELS: Record<string, string> = {
  str: 'STR',
  dex: 'DEX',
  int: 'INT',
};

const SCOPE_LABELS: Record<SkillScopeDto, string> = {
  universal: 'Universal',
  class: 'Classe',
};

const KIND_LABELS: Record<SkillCombatKind, string> = {
  damage_physical: 'Dano físico',
  damage_magic: 'Dano mágico',
  heal_ally: 'Cura',
};

function formatTarget(combat: CombatSkillDefinition): string {
  const pool =
    combat.targetPool === 'enemies'
      ? combat.targetScope === 'all'
        ? 'Todos inimigos'
        : '1 inimigo'
      : combat.targetScope === 'all'
        ? 'Todos aliados'
        : '1 aliado';

  const priorityLabels: Record<CombatSkillDefinition['targetPriority'], string> = {
    lowest_hp: 'menor HP',
    lowest_hp_percent: 'menor HP%',
    highest_hp: 'maior HP',
    highest_hp_percent: 'maior HP%',
  };

  if (combat.targetScope === 'single') {
    return `${pool} (${priorityLabels[combat.targetPriority]})`;
  }

  return pool;
}

function formatCooldown(combat: CombatSkillDefinition): string {
  if (combat.cooldownTurns <= 0) return 'Sem recarga';
  return combat.cooldownTurns === 1 ? '1 turno' : `${combat.cooldownTurns} turnos`;
}

export function formatScalingLabel(scalingKey: string): string {
  return SCALING_LABELS[scalingKey] ?? scalingKey.toUpperCase();
}

export function formatScopeLabel(scope: SkillScopeDto): string {
  return SCOPE_LABELS[scope];
}

export function formatBranchLabel(branch: SkillBranchDto): string {
  return SKILL_BRANCH_LABELS[branch];
}

export function buildSkillBattleStats(
  hero: Hero,
  skillId: string,
  scalingKey: string,
  powerCalculator = new SkillPowerCalculator(),
): HeroActiveSkillStatDto[] {
  const combat = getHeroCombatSkill(skillId);
  if (!combat) return [];

  const stats: HeroActiveSkillStatDto[] = [
    { label: 'Tipo', value: KIND_LABELS[combat.kind] },
    { label: 'Alvo', value: formatTarget(combat) },
  ];

  if (combat.usesAttackStat) {
    stats.push({ label: 'Poder', value: `ATK do herói (${hero.attack})` });
  } else {
    const estimatedPower = powerCalculator.calculateForHero(combat, hero);
    const scaling = formatScalingLabel(scalingKey);
    stats.push({ label: 'Poder', value: `~${estimatedPower} (escala ${scaling})` });
  }

  stats.push({ label: 'Recarga', value: formatCooldown(combat) });

  if (combat.initialCooldown > 0) {
    const turns =
      combat.initialCooldown === 1 ? '1 turno' : `${combat.initialCooldown} turnos`;
    stats.push({ label: 'Início', value: `Aguarda ${turns}` });
  }

  if (combat.healConditionThreshold !== undefined) {
    const threshold = Math.round(combat.healConditionThreshold * 100);
    stats.push({ label: 'Condição', value: `Só se aliado abaixo de ${threshold}% HP` });
  }

  return stats;
}
