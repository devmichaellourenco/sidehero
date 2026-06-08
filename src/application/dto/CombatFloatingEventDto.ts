export interface CombatFloatingEventDto {
  target: 'hero' | 'enemy';
  targetId: string;
  kind: 'damage' | 'heal';
  amount: number;
}
