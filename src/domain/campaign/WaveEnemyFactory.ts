import { Enemy } from '../entities/Enemy';
import { getEnemyRosterEntry } from '../enemies/EnemyRosterCatalog';
import { stageScalingFactorsForTier } from '../progression/StageScalingCatalog';
import { Stats } from '../value-objects/Stats';
import { PhaseId } from './CampaignIds';
import { EnemyRole, EnemySlot, WaveDefinition } from './WaveDefinition';

export interface WaveSpawnContext {
  phaseId: PhaseId;
  waveIndex: number;
  difficultyTier: number;
  isBossWave: boolean;
  statMultiplier?: number;
  milestoneGoldScale?: number;
}

const ROLE_SCALE: Record<EnemyRole, { stat: number; reward: number }> = {
  trash: { stat: 1, reward: 1 },
  elite: { stat: 1.35, reward: 1.25 },
  boss: { stat: 1.75, reward: 1.6 },
};

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
  const scaling = stageScalingFactorsForTier(
    context.difficultyTier,
    context.statMultiplier ?? 1,
  );
  const roleScale = ROLE_SCALE[slot.role];
  const attack = Math.floor(10 * scaling.atk * roleScale.stat);
  const defense = Math.floor(4 * scaling.atk * roleScale.stat);
  const maxHealth = Math.floor(60 * scaling.hp * roleScale.stat);
  const goldReward = Math.floor(
    8 * scaling.gold * roleScale.reward * context.goldMultiplier * (context.milestoneGoldScale ?? 1),
  );
  const xpBase = slot.role === 'boss' ? 8 : slot.role === 'elite' ? 5 : 2;
  const xpReward = Math.floor(xpBase * scaling.exp * roleScale.reward);

  const rosterEntry = getEnemyRosterEntry(slot.enemyType);
  const baseName = rosterEntry?.name ?? slot.enemyType;
  const prefix = slot.role === 'boss' ? 'Boss ' : slot.role === 'elite' ? 'Elite ' : '';
  const suffix = slot.count > 1 ? ` ${context.slotIndex + 1}` : '';
  const defaultName = `${prefix}${baseName} Lv.${context.difficultyTier}${suffix}`;
  const name = slot.displayName
    ? slot.count > 1
      ? `${slot.displayName} ${context.slotIndex + 1}`
      : slot.displayName
    : defaultName;

  return Enemy.restore({
    id: `${context.phaseId}-w${context.waveIndex}-s${context.slotIndex}`,
    name,
    enemyType: slot.enemyType,
    stage: context.difficultyTier,
    stats: Stats.fromBase(attack, defense, maxHealth),
    goldReward,
    xpReward,
    role: slot.role,
  });
}
