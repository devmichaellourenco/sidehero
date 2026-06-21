import { CombatStatusEffect, StatusEffectMap } from './CombatStatusEffect';
import { DamageElement } from '../../combat/DamageElement';

export interface DotTickResult {
  damage: number;
  dotElement?: DamageElement;
  tracker: CombatStatusEffectTracker;
}

export class CombatStatusEffectTracker {
  constructor(private readonly effects: StatusEffectMap) {}

  static fromMap(effects: StatusEffectMap | undefined): CombatStatusEffectTracker {
    return new CombatStatusEffectTracker(effects ?? {});
  }

  toMap(): StatusEffectMap {
    return structuredClone(this.effects);
  }

  listFor(combatantKey: string): CombatStatusEffect[] {
    return [...(this.effects[combatantKey] ?? [])];
  }

  apply(params: {
    combatantKey: string;
    skillId: string;
    kind: CombatStatusEffect['kind'];
    magnitude: number;
    durationTurns: number;
    dotElement?: CombatStatusEffect['dotElement'];
  }): CombatStatusEffectTracker {
    const next = structuredClone(this.effects);
    next[params.combatantKey] ??= [];

    const withoutSkill = next[params.combatantKey].filter(
      (effect) => effect.skillId !== params.skillId,
    );

    withoutSkill.push({
      skillId: params.skillId,
      kind: params.kind,
      magnitude: Math.max(1, params.magnitude),
      remainingTurns: Math.max(1, params.durationTurns),
      dotElement: params.dotElement,
    });

    next[params.combatantKey] = withoutSkill;
    return new CombatStatusEffectTracker(next);
  }

  tickOnTurnEnd(combatantKey: string): CombatStatusEffectTracker {
    const current = this.effects[combatantKey];
    if (!current || current.length === 0) return this;

    const next = structuredClone(this.effects);
    next[combatantKey] = current
      .map((effect) => ({
        ...effect,
        remainingTurns: effect.remainingTurns - 1,
      }))
      .filter((effect) => effect.remainingTurns > 0);

    if (next[combatantKey].length === 0) {
      delete next[combatantKey];
    }

    return new CombatStatusEffectTracker(next);
  }

  tickDotDamage(combatantKey: string): DotTickResult {
    const dots = (this.effects[combatantKey] ?? []).filter((effect) => effect.kind === 'dot');
    const damage = dots.reduce((sum, effect) => sum + effect.magnitude, 0);
    const dotElement = dots[0]?.dotElement;
    return { damage, dotElement, tracker: this };
  }

  getAttackBonus(combatantKey: string): number {
    return this.sumMagnitude(combatantKey, 'buff_attack');
  }

  getDefensePenalty(combatantKey: string): number {
    return this.sumMagnitude(combatantKey, 'debuff_defense');
  }

  private sumMagnitude(
    combatantKey: string,
    kind: CombatStatusEffect['kind'],
  ): number {
    return (this.effects[combatantKey] ?? [])
      .filter((effect) => effect.kind === kind)
      .reduce((sum, effect) => sum + effect.magnitude, 0);
  }
}
