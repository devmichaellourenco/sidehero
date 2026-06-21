import { DamageComponent } from './DamageComponent';
import { DamageElement } from './DamageElement';
import { DefensiveMitigation, ZERO_DEFENSIVE } from './DefensiveMitigation';
import { getEffectiveResistance, ResistanceProfile } from './ResistanceProfile';
import { mitigatePhysicalDamage } from '../services/combat/CombatDamageResolver';

export interface MitigationTarget {
  armor: number;
  stageLevel: number;
  resistances: ResistanceProfile;
  defensive?: DefensiveMitigation;
}

export function mitigateElementalDamage(
  rawDamage: number,
  element: DamageElement,
  target: MitigationTarget,
): number {
  if (rawDamage <= 0) {
    return 0;
  }

  if (element === 'physical') {
    return mitigatePhysicalDamage(rawDamage, target.armor, target.stageLevel);
  }

  const effectiveResistance = getEffectiveResistance(target.resistances, element);
  const scaled =
    effectiveResistance >= 0
      ? rawDamage * (1 - effectiveResistance / 100)
      : rawDamage * (1 + Math.abs(effectiveResistance) / 100);

  return Math.max(0, Math.floor(scaled));
}

export function resolveComponentDamage(
  rawPower: number,
  component: DamageComponent,
  target: MitigationTarget,
): number {
  const portion = rawPower * component.weight;
  return mitigateElementalDamage(portion, component.element, target);
}

export function resolveMultiComponentDamage(
  rawPower: number,
  components: DamageComponent[],
  target: MitigationTarget,
): number {
  const total = components.reduce(
    (sum, component) => sum + resolveComponentDamage(rawPower, component, target),
    0,
  );

  if (total <= 0) {
    return 0;
  }

  return Math.max(1, total);
}
