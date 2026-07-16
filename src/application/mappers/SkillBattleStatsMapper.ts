import {
  applyCooldownReduction,
  CombatProfileProvider,
} from '../../domain/combat/CombatProfileProvider';
import {
  buildHeroSkillPowerBreakdown,
  estimateHeroSkillThroughput,
  ThroughputBreakdownLine,
} from '../../domain/combat/DamageThroughputEstimate';
import { DAMAGE_ELEMENT_LABELS } from '../../domain/combat/DamageElement';
import {
  formatCooldownLabel,
  getCooldownSeconds,
  getInitialCooldownSeconds,
} from '../../domain/combat/SkillCooldownTiming';
import { Hero } from '../../domain/entities/Hero';
import { getTargetPriorityPercent } from '../../domain/progression/combat/CombatSkillTargeting';
import { CombatSkillDefinition } from '../../domain/progression/combat/CombatSkillDefinition';
import { getHeroCombatSkill } from '../../domain/progression/combat/HeroCombatSkillCatalog';
import { SkillCombatKind } from '../../domain/progression/combat/SkillCombatKind';
import { SkillPowerCalculator } from '../../domain/progression/combat/SkillPowerCalculator';
import {
  HeroActiveSkillStatDto,
  HeroActiveSkillStatTooltipLineDto,
} from '../dto/GameStateDto';
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
  damage: 'Dano',
  heal_ally: 'Cura',
  buff_attack: 'Buff ATK',
  debuff_defense: 'Debuff DEF',
};

const combatProfiles = new CombatProfileProvider();

function toTooltipLines(lines: ThroughputBreakdownLine[]): HeroActiveSkillStatTooltipLineDto[] {
  return lines.map((line) => ({ text: line.text, icon: line.icon }));
}

function tip(...lines: HeroActiveSkillStatTooltipLineDto[]): HeroActiveSkillStatTooltipLineDto[] {
  return lines;
}

function formatDamageType(combat: CombatSkillDefinition): string {
  if (!combat.damageComponents?.length) {
    return KIND_LABELS.damage;
  }

  const labels = [
    ...new Set(combat.damageComponents.map((entry) => DAMAGE_ELEMENT_LABELS[entry.element])),
  ];
  return labels.join(' + ');
}

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
    const percent = getTargetPriorityPercent(combat);
    return `${pool} (${priorityLabels[combat.targetPriority]} · ${percent}%)`;
  }

  return pool;
}

function formatEffectiveCooldown(combat: CombatSkillDefinition, hero: Hero): string {
  const baseSeconds = getCooldownSeconds(combat);
  if (baseSeconds <= 0) return 'Sem recarga';

  const profile = combatProfiles.forHero(hero);
  const effective = applyCooldownReduction(baseSeconds, profile.cooldownReduction);
  if (Math.abs(effective - baseSeconds) < 0.05) {
    return formatCooldownLabel(effective);
  }

  return `${formatCooldownLabel(effective)} (base ${formatCooldownLabel(baseSeconds)}, CDR ${(profile.cooldownReduction * 100).toFixed(0)}%)`;
}

function buildTypeTooltip(combat: CombatSkillDefinition): HeroActiveSkillStatTooltipLineDto[] {
  if (combat.kind !== 'damage' || !combat.damageComponents?.length) {
    return tip(
      { text: `Categoria de combate: ${KIND_LABELS[combat.kind]}.` },
      { text: 'Define o papel da skill no motor de combate (dano, cura, buff ou debuff).' },
    );
  }

  return tip(
    { icon: 'rune', text: 'Elementos e entrega deste golpe:' },
    ...combat.damageComponents.map((component) => ({
      icon: 'attack' as const,
      text: `${DAMAGE_ELEMENT_LABELS[component.element]} · ${component.delivery} · peso ${(component.weight * 100).toFixed(0)}%`,
    })),
    {
      text: 'O peso divide o poder entre elementos antes dos bônus de gear.',
    },
  );
}

function buildTargetTooltip(combat: CombatSkillDefinition): HeroActiveSkillStatTooltipLineDto[] {
  const lines = tip(
    {
      icon: 'defense',
      text: `Pool: ${combat.targetPool === 'enemies' ? 'inimigos' : 'aliados'}`,
    },
    {
      text: `Alcance: ${combat.targetScope === 'all' ? 'todos no pool' : 'um único alvo'}`,
    },
  );

  if (combat.targetScope === 'single') {
    const percent = getTargetPriorityPercent(combat);
    lines.push({
      text: `Prioridade ${combat.targetPriority}: ${percent}% de chance de mirar o alvo preferido; senão outro aleatório do pool.`,
    });
  }

  return lines;
}

function buildCooldownTooltip(combat: CombatSkillDefinition, hero: Hero): HeroActiveSkillStatTooltipLineDto[] {
  const baseSeconds = getCooldownSeconds(combat);
  if (baseSeconds <= 0) {
    return tip(
      { text: 'Esta ação não entra em recarga (ataque contínuo ou skill sem CD).' },
      { icon: 'attack', text: 'A taxa vem da velocidade de ataque do herói.' },
    );
  }

  const profile = combatProfiles.forHero(hero);
  const effective = applyCooldownReduction(baseSeconds, profile.cooldownReduction);

  return tip(
    { icon: 'rune', text: `Recarga base do catálogo = ${baseSeconds.toFixed(2)}s` },
    {
      icon: 'improvement',
      text: `CDR do equipamento = ${(profile.cooldownReduction * 100).toFixed(1)}%`,
    },
    {
      text: `Recarga efetiva = base × (1 − CDR) = ${effective.toFixed(2)}s`,
    },
    {
      icon: 'power_attack',
      text: `Cast speed ${profile.castSpeed.toFixed(2)} também afeta o recovery após o cast (ver DPS).`,
    },
  );
}

/** DPS alinhado ao combate: poder + bônus de gear + crit esperado + taxa (ASPD ou CD/CDR + recovery). */
function appendDamageThroughputStats(
  stats: HeroActiveSkillStatDto[],
  combat: CombatSkillDefinition,
  hero: Hero,
  powerCalculator: SkillPowerCalculator,
): void {
  const estimate = estimateHeroSkillThroughput(hero, combat, powerCalculator, combatProfiles);
  if (!estimate) return;

  if (estimate.effectiveCooldownSeconds === null) {
    stats.push({
      label: 'Dano/hit esperado',
      value: `~${estimate.expectedDamagePerHit.toFixed(1)} (poder × gear × crit)`,
      tooltipLines: toTooltipLines(estimate.hitBreakdown),
    });
    stats.push({
      label: 'APS efetiva',
      value: `${estimate.ratePerSecond.toFixed(2)}/s (vel. ${estimate.attackSpeed.toFixed(2)})`,
      tooltipLines: toTooltipLines(estimate.rateBreakdown),
    });
    stats.push({
      label: 'DPS estimado',
      value: `~${estimate.dps.toFixed(1)} (ataque contínuo)`,
      emphasize: true,
      tooltipLines: toTooltipLines(estimate.dpsBreakdown),
    });
    return;
  }

  stats.push({
    label: 'Dano/cast esperado',
    value: `~${estimate.expectedDamagePerHit.toFixed(1)} (poder × gear × crit)`,
    tooltipLines: toTooltipLines(estimate.hitBreakdown),
  });
  stats.push({
    label: 'Casts/s',
    value: `${estimate.ratePerSecond.toFixed(2)}/s`,
    tooltipLines: toTooltipLines(estimate.rateBreakdown),
  });
  stats.push({
    label: 'DPS estimado',
    value: `~${estimate.dps.toFixed(1)} (cast contínuo da skill)`,
    emphasize: true,
    tooltipLines: toTooltipLines(estimate.dpsBreakdown),
  });
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

  const estimate =
    combat.kind === 'damage'
      ? estimateHeroSkillThroughput(hero, combat, powerCalculator, combatProfiles)
      : null;

  const stats: HeroActiveSkillStatDto[] = [
    {
      label: 'Tipo',
      value: combat.kind === 'damage' ? formatDamageType(combat) : KIND_LABELS[combat.kind],
      tooltipLines: buildTypeTooltip(combat),
    },
    {
      label: 'Alvo',
      value: formatTarget(combat),
      tooltipLines: buildTargetTooltip(combat),
    },
  ];

  if (combat.usesAttackStat) {
    const estimatedPower = powerCalculator.calculateForHero(combat, hero);
    stats.push({
      label: 'Poder',
      value: `ATK do herói (${hero.attack})`,
      tooltipLines: toTooltipLines(buildHeroSkillPowerBreakdown(combat, hero, estimatedPower)),
    });
  } else {
    const estimatedPower = powerCalculator.calculateForHero(combat, hero);
    const scaling = formatScalingLabel(scalingKey);
    stats.push({
      label: 'Poder',
      value: `~${estimatedPower} (escala ${scaling})`,
      tooltipLines: toTooltipLines(buildHeroSkillPowerBreakdown(combat, hero, estimatedPower)),
    });
  }

  if (estimate && combat.kind === 'damage') {
    const gearSummary =
      estimate.physicalDamagePercent !== 0
        ? `físico +${estimate.physicalDamagePercent}%`
        : `${estimate.gearBreakdown.length} componente(s)`;
    stats.push({
      label: 'Bônus de gear no dano',
      value: gearSummary,
      tooltipLines: toTooltipLines(estimate.gearBreakdown),
    });
    stats.push({
      label: 'Fator de crit',
      value: `${estimate.critFactor.toFixed(3)}× (${(estimate.critChance * 100).toFixed(1)}% · ${estimate.critDamage.toFixed(2)}×)`,
      tooltipLines: tip(
        {
          icon: 'power_attack',
          text: `Chance de crítico = ${(estimate.critChance * 100).toFixed(1)}%`,
        },
        {
          icon: 'attack',
          text: `Multiplicador de crítico = ${estimate.critDamage.toFixed(2)}×`,
        },
        {
          text: `Fator esperado = 1 + chance × (multiplicador − 1) = ${estimate.critFactor.toFixed(3)}`,
        },
        {
          text: 'O fator multiplica o dano médio por acerto (não o pico do crítico puro).',
        },
      ),
    });
  }

  appendDamageThroughputStats(stats, combat, hero, powerCalculator);

  stats.push({
    label: 'Recarga',
    value: formatEffectiveCooldown(combat, hero),
    tooltipLines: buildCooldownTooltip(combat, hero),
  });

  const initialSeconds = getInitialCooldownSeconds(combat);
  if (initialSeconds > 0) {
    stats.push({
      label: 'Início',
      value: `Aguarda ${formatCooldownLabel(initialSeconds)}`,
      tooltipLines: tip(
        {
          icon: 'rune',
          text: `Ao entrar em combate, a skill começa com ${initialSeconds.toFixed(2)}s de espera.`,
        },
        { text: 'Depois do primeiro cast, vale a recarga normal (com CDR).' },
      ),
    });
  }

  if (combat.healConditionThreshold !== undefined) {
    const threshold = Math.round(combat.healConditionThreshold * 100);
    stats.push({
      label: 'Condição',
      value: `Só se aliado abaixo de ${threshold}% HP`,
      tooltipLines: tip(
        {
          icon: 'health',
          text: `Só dispara se o alvo escolhido estiver com HP% < ${threshold}%.`,
        },
        { text: 'Evita gastar o cast de cura em aliados ainda saudáveis.' },
      ),
    });
  }

  if (combat.effectDurationTurns !== undefined && combat.effectDurationTurns > 0) {
    const turns =
      combat.effectDurationTurns === 1 ? '1 turno' : `${combat.effectDurationTurns} turnos`;
    stats.push({
      label: 'Duração',
      value: turns,
      tooltipLines: tip(
        {
          icon: 'improvement',
          text: `O efeito permanece por ${combat.effectDurationTurns} turno(s) de combate.`,
        },
        { text: 'Turnos seguem o ritmo do tick de batalha, não o relógio de parede.' },
      ),
    });
  }

  return stats;
}
