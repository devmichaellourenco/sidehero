import { Enemy } from '../entities/Enemy';
import { resolvePhase } from './CampaignCatalog';
import { PhaseId } from './CampaignIds';
import { PhaseDefinition } from './PhaseDefinition';
import { spawnEnemiesForWave } from './WaveEnemyFactory';

export interface EncounterMeta {
  phaseId: PhaseId;
  waveIndex: number;
  waveCount: number;
  isBossWave: boolean;
}

export interface ResolvedEncounter {
  enemies: Enemy[];
  meta: EncounterMeta;
  phase: PhaseDefinition;
}

export class EncounterResolver {
  resolve(phaseId: PhaseId, waveIndex: number): ResolvedEncounter | null {
    const phase = resolvePhase(phaseId);
    if (!phase || waveIndex < 0 || waveIndex >= phase.waves.length) {
      return null;
    }

    const wave = phase.waves[waveIndex];
    const isBossWave = waveIndex === phase.waves.length - 1;
    const enemies = spawnEnemiesForWave(wave, {
      phaseId,
      waveIndex,
      difficultyTier: phase.difficultyTier,
      isBossWave,
      statMultiplier: phase.statMultiplier ?? 1,
    });

    return {
      enemies,
      phase,
      meta: {
        phaseId,
        waveIndex,
        waveCount: phase.waves.length,
        isBossWave,
      },
    };
  }
}
