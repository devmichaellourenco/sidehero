import { EnemyType } from '../entities/EnemyType';

export type EnemyRole = 'trash' | 'elite' | 'boss';

export interface EnemySlot {
  enemyType: EnemyType;
  role: EnemyRole;
  count: number;
}

export interface WaveDefinition {
  id: string;
  slots: EnemySlot[];
  goldMultiplier?: number;
}
