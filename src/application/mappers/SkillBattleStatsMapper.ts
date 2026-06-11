import { formatCooldownLabel, getCooldownSeconds, getInitialCooldownSeconds } from '../../domain/combat/SkillCooldownTiming';
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
  buff_attack: 'Buff ATK',
  debuff_defense: 'Debuff DEF',
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
  const seconds = getCooldownSeconds(combat);
  if (seconds <= 0) return 'Sem recarga';
  return formatCooldownLabel(seconds);
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

  const initialSeconds = getInitialCooldownSeconds(combat);
  if (initialSeconds > 0) {
    stats.push({ label: 'Início', value: `Aguarda ${formatCooldownLabel(initialSeconds)}` });
  }

  if (combat.healConditionThreshold !== undefined) {
    const threshold = Math.round(combat.healConditionThreshold * 100);
    stats.push({ label: 'Condição', value: `Só se aliado abaixo de ${threshold}% HP` });
  }

  if (combat.effectDurationTurns !== undefined && combat.effectDurationTurns > 0) {
    const turns =
      combat.effectDurationTurns === 1 ? '1 turno' : `${combat.effectDurationTurns} turnos`;
    stats.push({ label: 'Duração', value: turns });
  }

  return stats;
}
