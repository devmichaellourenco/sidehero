export type CombatFloatKind = 'damage' | 'heal' | 'crit' | 'buff' | 'debuff';

export interface CombatFloatingEventDto {
  target: 'hero' | 'enemy';
  targetId: string;
  kind: CombatFloatKind;
  amount: number;
}
