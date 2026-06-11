export type CombatFloatTarget = 'hero' | 'enemy';
export type CombatFloatKind = 'damage' | 'heal' | 'crit';

export interface CombatFloatingEvent {
  target: CombatFloatTarget;
  targetId: string;
  kind: CombatFloatKind;
  amount: number;
}

export function createDamageEvent(
  target: CombatFloatTarget,
  targetId: string,
  beforeHealth: number,
  afterHealth: number,
  isCrit = false,
): CombatFloatingEvent | null {
  const amount = Math.max(0, beforeHealth - afterHealth);
  if (amount <= 0) return null;

  return {
    target,
    targetId,
    kind: isCrit ? 'crit' : 'damage',
    amount,
  };
}

export function createHealEvent(
  targetId: string,
  beforeHealth: number,
  afterHealth: number,
): CombatFloatingEvent | null {
  const amount = Math.max(0, afterHealth - beforeHealth);
  if (amount <= 0) return null;

  return { target: 'hero', targetId, kind: 'heal', amount };
}
