import { Enemy } from '../entities/Enemy';
import { EnemyType, ENEMY_DEFINITIONS } from '../entities/EnemyType';
import { Stats } from '../value-objects/Stats';
import { PhaseId } from './CampaignIds';
import { EnemyRole, EnemySlot, WaveDefinition } from './WaveDefinition';

export interface WaveSpawnContext {
  phaseId: PhaseId;
  waveIndex: number;
  difficultyTier: number;
  isBossWave: boolean;
  statMultiplier?: number;
}

const ROLE_SCALE: Record<EnemyRole, { stat: number; reward: number }> = {
  trash: { stat: 1, reward: 1 },
  elite: { stat: 1.35, reward: 1.25 },
  boss: { stat: 1.75, reward: 1.6 },
};

/** Curva de escala: exige farm e equipamento para avançar nas fases altas. */
export function difficultyScale(tier: number, phaseMultiplier = 1): number {
  const normalized = Math.max(0, tier - 1);
  const base = 1 + Math.pow(normalized, 1.12) * 0.11;
  return base * phaseMultiplier;
}

export function spawnEnemiesForWave(
  wave: WaveDefinition,
  context: WaveSpawnContext,
): Enemy[] {
  const enemies: Enemy[] = [];
  let slotIndex = 0;

  for (const slot of wave.slots) {
    for (let copy = 0; copy < slot.count; copy++) {
      enemies.push(
        createEnemyFromSlot(slot, {
          ...context,
          slotIndex,
          goldMultiplier: wave.goldMultiplier ?? 1,
        }),
      );
      slotIndex += 1;
    }
  }

  return enemies;
}

function createEnemyFromSlot(
  slot: EnemySlot,
  context: WaveSpawnContext & { slotIndex: number; goldMultiplier: number },
): Enemy {
  const scale = difficultyScale(context.difficultyTier, context.statMultiplier ?? 1);
  const roleScale = ROLE_SCALE[slot.role];
  const attack = Math.floor(10 * scale * roleScale.stat);
  const defense = Math.floor(4 * scale * roleScale.stat);
  const maxHealth = Math.floor(60 * scale * roleScale.stat);
  const goldReward = Math.floor(8 * scale * roleScale.reward * context.goldMultiplier);
  const xpReward = context.isBossWave ? Math.floor(15 * scale * roleScale.reward) : 0;

  const definition = ENEMY_DEFINITIONS.find((entry) => entry.type === slot.enemyType);
  const baseName = definition?.name ?? slot.enemyType;
  const prefix = slot.role === 'boss' ? 'Boss ' : slot.role === 'elite' ? 'Elite ' : '';
  const suffix = slot.count > 1 ? ` ${context.slotIndex + 1}` : '';

  return Enemy.restore({
    id: `${context.phaseId}-w${context.waveIndex}-s${context.slotIndex}`,
    name: `${prefix}${baseName} Lv.${context.difficultyTier}${suffix}`,
    enemyType: slot.enemyType,
    stage: context.difficultyTier,
    stats: Stats.fromBase(attack, defense, maxHealth),
    goldReward,
    xpReward,
  });
}
