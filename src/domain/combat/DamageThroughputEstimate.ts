import { DamageComponent, normalizeDamageComponents } from './DamageComponent';
import { DAMAGE_ELEMENT_LABELS, DamageElement } from './DamageElement';
import {
  ElementalDamageFlatProfile,
  getEffectiveElementalDamageFlat,
  ZERO_ELEMENTAL_DAMAGE_FLAT,
} from './ElementalDamageFlatProfile';
import { elementalDamageFlatFromHeroEquipment } from './ElementalDamageFlatProfileAggregator';
import {
  ElementalDamageProfile,
  getEffectiveElementalDamageBonus,
  ZERO_ELEMENTAL_DAMAGE,
} from './ElementalDamageProfile';
import { elementalDamageProfileFromHeroEquipment } from './ElementalDamageProfileAggregator';
import { physicalDamagePercentFromHeroEquipment } from './GearStatAggregator';
import {
  applyCooldownReduction,
  CombatProfileProvider,
} from './CombatProfileProvider';
import {
  MIN_ACTION_INTERVAL_SECONDS,
  SKILL_ACTION_RECOVERY_SECONDS,
} from './CombatTimingConstants';
import { getCooldownSeconds } from './SkillCooldownTiming';
import { Hero } from '../entities/Hero';
import { getSkillById } from '../progression/SkillCatalog';
import { CombatSkillDefinition } from '../progression/combat/CombatSkillDefinition';
import {
  calculateHeroSkillRawPower,
  isPhysicalDamageSkill,
  PHYSICAL_DAMAGE_SKILL_MIN_ATK_RATIO,
  skillAttributeMultiplier,
  skillRankMultiplier,
} from '../progression/combat/SkillDamageBalance';
import { SkillPowerCalculator } from '../progression/combat/SkillPowerCalculator';

/** Chaves de ícone mapeadas na apresentação (`ASSETS.ui` / `ASSETS.skills`). */
export type ThroughputIconKey =
  | 'attack'
  | 'defense'
  | 'health'
  | 'improvement'
  | 'rune'
  | 'power_attack';

export interface ThroughputBreakdownLine {
  text: string;
  icon?: ThroughputIconKey;
}

export interface DamageThroughputEstimate {
  rawPower: number;
  outgoingPower: number;
  expectedDamagePerHit: number;
  ratePerSecond: number;
  dps: number;
  effectiveCooldownSeconds: number | null;
  baseCooldownSeconds: number | null;
  recoverySeconds: number | null;
  critFactor: number;
  critChance: number;
  critDamage: number;
  attackSpeed: number;
  castSpeed: number;
  cooldownReduction: number;
  physicalDamagePercent: number;
  powerBreakdown: ThroughputBreakdownLine[];
  gearBreakdown: ThroughputBreakdownLine[];
  hitBreakdown: ThroughputBreakdownLine[];
  rateBreakdown: ThroughputBreakdownLine[];
  dpsBreakdown: ThroughputBreakdownLine[];
}

export function expectedCritFactor(critChance: number, critDamage: number): number {
  return 1 + critChance * (critDamage - 1);
}

export function estimateAttackerOutgoingPower(
  rawPower: number,
  components: DamageComponent[],
  elementalBonus: ElementalDamageProfile = ZERO_ELEMENTAL_DAMAGE,
  elementalFlat: ElementalDamageFlatProfile = ZERO_ELEMENTAL_DAMAGE_FLAT,
  physicalDamagePercent = 0,
): number {
  const normalized = normalizeDamageComponents(components);
  return normalized.reduce((sum, component) => {
    const bonusPercent =
      component.element === 'physical'
        ? physicalDamagePercent
        : getEffectiveElementalDamageBonus(elementalBonus, component.element);
    const bonusFlat =
      component.element === 'physical'
        ? 0
        : getEffectiveElementalDamageFlat(elementalFlat, component.element);
    return (
      sum + rawPower * component.weight * (1 + bonusPercent / 100) + bonusFlat * component.weight
    );
  }, 0);
}

export function basicAttackActionsPerSecond(attackSpeed: number): number {
  const interval = Math.max(MIN_ACTION_INTERVAL_SECONDS, 1 / Math.max(attackSpeed, 0.01));
  return 1 / interval;
}

export function skillCastsPerSecond(
  baseCooldownSeconds: number,
  cooldownReduction: number,
  castSpeed: number,
): { rate: number; effectiveCooldownSeconds: number; recoverySeconds: number } {
  const effectiveCooldownSeconds = applyCooldownReduction(baseCooldownSeconds, cooldownReduction);
  const recoverySeconds = Math.max(
    MIN_ACTION_INTERVAL_SECONDS,
    SKILL_ACTION_RECOVERY_SECONDS / Math.max(castSpeed, 0.01),
  );
  const period = Math.max(effectiveCooldownSeconds, recoverySeconds, MIN_ACTION_INTERVAL_SECONDS);
  return {
    rate: 1 / period,
    effectiveCooldownSeconds,
    recoverySeconds,
  };
}

/** Passo a passo do poder exibido em Status (tooltip da linha Poder). */
export function buildHeroSkillPowerBreakdown(
  combat: CombatSkillDefinition,
  hero: Hero,
  rawPower: number,
): ThroughputBreakdownLine[] {
  if (combat.usesAttackStat) {
    return [
      { icon: 'attack', text: `ATK do herói = ${rawPower}` },
      { text: 'Ataque básico usa o ATK total (nível, atributos e equipamento).' },
      { icon: 'attack', text: `Poder final = ${rawPower}` },
    ];
  }

  const rank = hero.toProps().skillRanks[combat.skillId] ?? 1;
  const definition = getSkillById(combat.skillId);
  const scalingKey = (definition?.scaling ?? 'int') as 'str' | 'dex' | 'int';
  const attributeValue = hero.totalAttributes[scalingKey];
  const base = combat.basePower;
  const rankTerm = skillRankMultiplier(combat.powerPerRank, rank);
  const attrTerm = skillAttributeMultiplier(attributeValue, combat.attributeFactor);
  const product = calculateHeroSkillRawPower(combat, rank, attributeValue);
  const afterFloor = Math.max(1, Math.floor(product));

  const lines: ThroughputBreakdownLine[] = [
    {
      text: `Fórmula: Base × (powerPerRank × nível) × (${scalingKey.toUpperCase()} × fator)`,
    },
    { icon: 'rune', text: `Base = ${base}` },
    {
      icon: 'improvement',
      text: `Rank: ${combat.powerPerRank} × nível ${rank} = ${rankTerm}`,
    },
    {
      icon: 'power_attack',
      text: `${scalingKey.toUpperCase()} ${attributeValue} × ${combat.attributeFactor} = ${attrTerm.toFixed(2)}`,
    },
    {
      text: `Produto = ${base} × ${rankTerm} × ${attrTerm.toFixed(2)} = ${product.toFixed(2)}`,
    },
    { text: `floor(${product.toFixed(2)}) = ${afterFloor}` },
  ];

  if (isPhysicalDamageSkill(combat)) {
    const floor = Math.floor(hero.attack * PHYSICAL_DAMAGE_SKILL_MIN_ATK_RATIO);
    lines.push({
      icon: 'attack',
      text: `Piso físico: ATK ${hero.attack} × ${PHYSICAL_DAMAGE_SKILL_MIN_ATK_RATIO} = ${floor}`,
    });
    if (rawPower === floor && floor > afterFloor) {
      lines.push({ text: `Piso físico venceu o produto (${afterFloor} → ${rawPower}).` });
    }
  }

  lines.push({ icon: 'attack', text: `Poder final ≈ ${rawPower}` });
  return lines;
}

function buildGearBreakdown(
  components: DamageComponent[],
  elementalBonus: ElementalDamageProfile,
  elementalFlat: ElementalDamageFlatProfile,
  physicalPercent: number,
): ThroughputBreakdownLine[] {
  const lines: ThroughputBreakdownLine[] = [];
  const normalized = normalizeDamageComponents(components);

  for (const component of normalized) {
    const label = DAMAGE_ELEMENT_LABELS[component.element as DamageElement] ?? component.element;
    if (component.element === 'physical') {
      if (physicalPercent !== 0) {
        lines.push({
          icon: 'attack',
          text: `Físico (${(component.weight * 100).toFixed(0)}% do poder): +${physicalPercent}% dano físico do gear`,
        });
      } else {
        lines.push({
          icon: 'attack',
          text: `Físico (${(component.weight * 100).toFixed(0)}% do poder): sem bônus % extra de gear`,
        });
      }
      continue;
    }

    const percent = getEffectiveElementalDamageBonus(elementalBonus, component.element);
    const flat = getEffectiveElementalDamageFlat(elementalFlat, component.element);
    lines.push({
      icon: 'rune',
      text: `${label} (${(component.weight * 100).toFixed(0)}%): +${percent}% · +${flat} flat`,
    });
  }

  if (lines.length === 0) {
    lines.push({ text: 'Sem componentes de dano listados.' });
  }

  return lines;
}

export function estimateHeroSkillThroughput(
  hero: Hero,
  combat: CombatSkillDefinition,
  powerCalculator = new SkillPowerCalculator(),
  profiles = new CombatProfileProvider(),
): DamageThroughputEstimate | null {
  if (combat.kind !== 'damage') return null;

  const profile = profiles.forHero(hero);
  const equipment = hero.toProps().equipment;
  const rawPower = powerCalculator.calculateForHero(combat, hero);
  const components = combat.damageComponents ?? [
    { element: 'physical' as const, delivery: 'melee' as const, weight: 1 },
  ];
  const elementalBonus = elementalDamageProfileFromHeroEquipment(equipment);
  const elementalFlat = elementalDamageFlatFromHeroEquipment(equipment);
  const physicalPercent = physicalDamagePercentFromHeroEquipment(equipment);

  const outgoing = estimateAttackerOutgoingPower(
    rawPower,
    components,
    elementalBonus,
    elementalFlat,
    physicalPercent,
  );

  const critFactor = expectedCritFactor(profile.critChance, profile.critDamage);
  const expectedDamagePerHit = outgoing * critFactor;
  const powerBreakdown = buildHeroSkillPowerBreakdown(combat, hero, rawPower);
  const gearBreakdown = buildGearBreakdown(
    components,
    elementalBonus,
    elementalFlat,
    physicalPercent,
  );

  const hitBreakdown: ThroughputBreakdownLine[] = [
    { icon: 'attack', text: `Poder bruto = ${rawPower}` },
    { icon: 'rune', text: `Após bônus de gear nos elementos = ${outgoing.toFixed(2)}` },
    {
      icon: 'power_attack',
      text: `Crit esperado = 1 + ${(profile.critChance * 100).toFixed(1)}% × (${profile.critDamage.toFixed(2)} − 1) = ${critFactor.toFixed(3)}`,
    },
    {
      icon: 'attack',
      text: `Dano/hit esperado = ${outgoing.toFixed(2)} × ${critFactor.toFixed(3)} = ${expectedDamagePerHit.toFixed(2)}`,
    },
    { text: 'Não inclui armadura, resistências nem esquiva/bloqueio do alvo.' },
  ];

  if (combat.usesAttackStat || getCooldownSeconds(combat) <= 0) {
    const interval = Math.max(MIN_ACTION_INTERVAL_SECONDS, 1 / Math.max(profile.attackSpeed, 0.01));
    const ratePerSecond = 1 / interval;
    const dps = expectedDamagePerHit * ratePerSecond;
    const rateBreakdown: ThroughputBreakdownLine[] = [
      { icon: 'attack', text: `Vel. de ataque (perfil) = ${profile.attackSpeed.toFixed(2)}/s` },
      {
        text: `Intervalo = máx(${MIN_ACTION_INTERVAL_SECONDS}s, 1 ÷ ${profile.attackSpeed.toFixed(2)}) = ${interval.toFixed(3)}s`,
      },
      { icon: 'attack', text: `APS efetiva = 1 ÷ ${interval.toFixed(3)} = ${ratePerSecond.toFixed(3)}/s` },
    ];
    const dpsBreakdown: ThroughputBreakdownLine[] = [
      ...hitBreakdown.slice(0, 4),
      ...rateBreakdown,
      {
        icon: 'power_attack',
        text: `DPS = ${expectedDamagePerHit.toFixed(2)} × ${ratePerSecond.toFixed(3)} = ${dps.toFixed(2)}`,
      },
    ];

    return {
      rawPower,
      outgoingPower: outgoing,
      expectedDamagePerHit,
      ratePerSecond,
      dps,
      effectiveCooldownSeconds: null,
      baseCooldownSeconds: null,
      recoverySeconds: null,
      critFactor,
      critChance: profile.critChance,
      critDamage: profile.critDamage,
      attackSpeed: profile.attackSpeed,
      castSpeed: profile.castSpeed,
      cooldownReduction: profile.cooldownReduction,
      physicalDamagePercent: physicalPercent,
      powerBreakdown,
      gearBreakdown,
      hitBreakdown,
      rateBreakdown,
      dpsBreakdown,
    };
  }

  const baseCooldown = getCooldownSeconds(combat);
  const casting = skillCastsPerSecond(baseCooldown, profile.cooldownReduction, profile.castSpeed);
  const dps = expectedDamagePerHit * casting.rate;
  const rateBreakdown: ThroughputBreakdownLine[] = [
    { icon: 'rune', text: `Recarga base = ${baseCooldown.toFixed(2)}s` },
    {
      icon: 'improvement',
      text: `CDR do gear = ${(profile.cooldownReduction * 100).toFixed(1)}% → recarga efetiva ${casting.effectiveCooldownSeconds.toFixed(2)}s`,
    },
    {
      icon: 'power_attack',
      text: `Recovery pós-skill = máx(${MIN_ACTION_INTERVAL_SECONDS}s, ${SKILL_ACTION_RECOVERY_SECONDS} ÷ cast ${profile.castSpeed.toFixed(2)}) = ${casting.recoverySeconds.toFixed(3)}s`,
    },
    {
      text: `Período entre casts = máx(recarga efetiva, recovery) = ${Math.max(casting.effectiveCooldownSeconds, casting.recoverySeconds).toFixed(3)}s`,
    },
    { text: `Casts/s = ${casting.rate.toFixed(3)}` },
  ];
  const dpsBreakdown: ThroughputBreakdownLine[] = [
    ...hitBreakdown.slice(0, 4),
    ...rateBreakdown,
    {
      icon: 'power_attack',
      text: `DPS = ${expectedDamagePerHit.toFixed(2)} × ${casting.rate.toFixed(3)} = ${dps.toFixed(2)}`,
    },
  ];

  return {
    rawPower,
    outgoingPower: outgoing,
    expectedDamagePerHit,
    ratePerSecond: casting.rate,
    dps,
    effectiveCooldownSeconds: casting.effectiveCooldownSeconds,
    baseCooldownSeconds: baseCooldown,
    recoverySeconds: casting.recoverySeconds,
    critFactor,
    critChance: profile.critChance,
    critDamage: profile.critDamage,
    attackSpeed: profile.attackSpeed,
    castSpeed: profile.castSpeed,
    cooldownReduction: profile.cooldownReduction,
    physicalDamagePercent: physicalPercent,
    powerBreakdown,
    gearBreakdown,
    hitBreakdown,
    rateBreakdown,
    dpsBreakdown,
  };
}
