import { PhaseId, buildPhaseId } from './CampaignIds';
import { PhaseDefinition } from './PhaseDefinition';
import { EnemySlot, WaveDefinition } from './WaveDefinition';

function wave(id: string, slots: EnemySlot[], goldMultiplier = 1): WaveDefinition {
  return { id, slots, goldMultiplier };
}

function trash(type: EnemySlot['enemyType'], count = 1): EnemySlot {
  return { enemyType: type, role: 'trash', count };
}

function elite(type: EnemySlot['enemyType'], count = 1): EnemySlot {
  return { enemyType: type, role: 'elite', count };
}

function boss(type: EnemySlot['enemyType'], count = 1): EnemySlot {
  return { enemyType: type, role: 'boss', count };
}

export interface MilestoneBlueprint {
  displayName: string;
  waves: WaveDefinition[];
  statMultiplier: number;
  majorMilestone?: boolean;
}

/** Composições únicas para cada fase X-50 (boss de capítulo). */
const MILESTONE_BY_PHASE_ID: Record<PhaseId, MilestoneBlueprint> = {
  [buildPhaseId(1, 50)]: {
    displayName: 'Guardião das Esgotos',
    majorMilestone: true,
    statMultiplier: 1.5,
    waves: [
      wave('w1', [trash('slime', 3), trash('goblin', 2)]),
      wave('w2', [elite('goblin', 2), elite('slime', 2)], 1.15),
      wave('w3', [elite('orc'), trash('goblin', 2)], 1.2),
      wave('w4', [boss('orc'), elite('goblin')], 1.7),
    ],
  },
  [buildPhaseId(2, 50)]: {
    displayName: 'Capitão da Mina',
    majorMilestone: true,
    statMultiplier: 1.55,
    waves: [
      wave('w1', [trash('goblin', 2), trash('orc', 2)]),
      wave('w2', [elite('orc', 2), elite('goblin')], 1.2),
      wave('w3', [elite('wraith'), elite('orc')], 1.3),
      wave('w4', [boss('orc', 2)], 1.75),
    ],
  },
  [buildPhaseId(3, 50)]: {
    displayName: 'Espectro de Valdris',
    statMultiplier: 1.48,
    waves: [
      wave('w1', [trash('wraith', 2), trash('orc')]),
      wave('w2', [elite('wraith', 2)], 1.2),
      wave('w3', [elite('orc'), elite('wraith')], 1.25),
      wave('w4', [boss('wraith'), elite('goblin', 2)], 1.65),
    ],
  },
  [buildPhaseId(4, 50)]: {
    displayName: 'Duque de Morthaven',
    statMultiplier: 1.5,
    waves: [
      wave('w1', [trash('goblin', 2), trash('wraith', 2)]),
      wave('w2', [elite('orc'), elite('wraith')], 1.2),
      wave('w3', [elite('dragon'), trash('orc', 2)], 1.3),
      wave('w4', [boss('wraith'), boss('orc')], 1.7),
    ],
  },
  [buildPhaseId(5, 50)]: {
    displayName: 'Colosso do Céu Quebrado',
    majorMilestone: true,
    statMultiplier: 1.65,
    waves: [
      wave('w1', [trash('wraith', 2), trash('dragon')]),
      wave('w2', [elite('dragon', 2), elite('wraith')], 1.25),
      wave('w3', [elite('dragon'), elite('orc', 2)], 1.35),
      wave('w4', [boss('dragon'), elite('wraith', 2)], 1.85),
    ],
  },
  [buildPhaseId(6, 50)]: {
    displayName: 'Senhor do Abismo',
    statMultiplier: 1.52,
    waves: [
      wave('w1', [trash('dragon', 2), trash('wraith', 2)]),
      wave('w2', [elite('wraith', 2), elite('dragon')], 1.25),
      wave('w3', [elite('dragon', 2)], 1.3),
      wave('w4', [boss('wraith'), boss('dragon')], 1.72),
    ],
  },
  [buildPhaseId(7, 50)]: {
    displayName: 'Forjador Eterno',
    statMultiplier: 1.54,
    waves: [
      wave('w1', [trash('orc', 3), elite('goblin', 2)]),
      wave('w2', [elite('dragon'), elite('orc', 2)], 1.25),
      wave('w3', [elite('wraith'), elite('dragon')], 1.32),
      wave('w4', [boss('dragon'), elite('orc', 2)], 1.75),
    ],
  },
  [buildPhaseId(8, 50)]: {
    displayName: 'Guardião do Bosque',
    statMultiplier: 1.56,
    waves: [
      wave('w1', [trash('wraith', 3), trash('slime', 2)]),
      wave('w2', [elite('wraith', 2), elite('dragon')], 1.28),
      wave('w3', [elite('dragon', 2), trash('orc', 2)], 1.33),
      wave('w4', [boss('wraith', 2), elite('dragon')], 1.78),
    ],
  },
  [buildPhaseId(9, 50)]: {
    displayName: 'Sentinela do Crepúsculo',
    statMultiplier: 1.58,
    waves: [
      wave('w1', [trash('dragon', 2), trash('wraith', 3)]),
      wave('w2', [elite('dragon', 2), elite('wraith', 2)], 1.3),
      wave('w3', [elite('dragon'), elite('wraith'), elite('orc')], 1.38),
      wave('w4', [boss('dragon'), boss('wraith')], 1.8),
    ],
  },
  [buildPhaseId(10, 50)]: {
    displayName: 'Soberano do Vazio',
    majorMilestone: true,
    statMultiplier: 1.95,
    waves: [
      wave('w1', [trash('dragon', 3), trash('wraith', 3)]),
      wave('w2', [elite('dragon', 2), elite('wraith', 2), elite('orc', 2)], 1.35),
      wave('w3', [elite('dragon', 2), elite('wraith', 2)], 1.45),
      wave('w4', [boss('dragon'), boss('wraith'), elite('dragon')], 2.1),
    ],
  },
};

export function getMilestoneBlueprint(phaseId: PhaseId): MilestoneBlueprint | null {
  return MILESTONE_BY_PHASE_ID[phaseId] ?? null;
}

export function isMajorMilestoneTier(tier: number): boolean {
  return tier === 50 || tier === 100 || tier === 250 || tier === 500;
}

export function applyMilestoneBlueprint(
  phase: PhaseDefinition,
  blueprint: MilestoneBlueprint,
): PhaseDefinition {
  return {
    ...phase,
    displayName: blueprint.displayName,
    waves: blueprint.waves,
    statMultiplier: blueprint.statMultiplier,
    milestoneBoss: true,
    seasonFinale: phase.seasonFinale,
  };
}
