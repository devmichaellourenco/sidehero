import { EnemyType } from '../entities/EnemyType';
import { ENEMY_DEFINITIONS } from '../entities/EnemyType';
import {
  MapId,
  PhaseId,
  buildPhaseId,
  difficultyTierForPhase,
  parsePhaseId,
} from './CampaignIds';
import { PhaseDefinition } from './PhaseDefinition';
import { EnemySlot, WaveDefinition } from './WaveDefinition';

const MAP_CONFIG: Record<
  MapId,
  { campaignId: 'apprentice'; displayPrefix: string; maxPhases: number; mapIndex: number }
> = {
  stendra: { campaignId: 'apprentice', displayPrefix: 'Estrenda', maxPhases: 50, mapIndex: 1 },
  gondonor: { campaignId: 'apprentice', displayPrefix: 'Gondonor', maxPhases: 50, mapIndex: 2 },
};

export class ProceduralPhaseGenerator {
  generate(mapId: MapId, phaseNumber: number): PhaseDefinition | null {
    const config = MAP_CONFIG[mapId];
    if (!config || phaseNumber < 1 || phaseNumber > config.maxPhases) {
      return null;
    }

    const phaseId = buildPhaseId(config.mapIndex, phaseNumber);
    const waveCount = Math.min(5, 2 + Math.floor(phaseNumber / 12));
    const waves = this.buildWaves(phaseNumber, waveCount);
    const unlocks = this.resolveUnlocks(mapId, config.mapIndex, phaseNumber, config.maxPhases);

    return {
      id: phaseId,
      campaignId: config.campaignId,
      mapId,
      displayName: `${config.displayPrefix} ${phaseId}`,
      difficultyTier: difficultyTierForPhase(config.mapIndex, phaseNumber),
      waves,
      unlocks,
    };
  }

  generateByPhaseId(phaseId: PhaseId): PhaseDefinition | null {
    const { mapIndex, phaseNumber } = parsePhaseId(phaseId);
    const mapId: MapId = mapIndex === 2 ? 'gondonor' : 'stendra';
    return this.generate(mapId, phaseNumber);
  }

  private buildWaves(phaseNumber: number, waveCount: number): WaveDefinition[] {
    const waves: WaveDefinition[] = [];

    for (let index = 0; index < waveCount; index++) {
      const isBoss = index === waveCount - 1;
      const enemyType = this.pickEnemyType(phaseNumber, index, isBoss);
      const count = isBoss ? (phaseNumber % 10 === 0 ? 2 : 1) : 1 + (index % 2);

      const role = isBoss ? 'boss' : index === waveCount - 2 && waveCount > 2 ? 'elite' : 'trash';
      waves.push({
        id: `w${index + 1}`,
        slots: [{ enemyType, role, count }],
        goldMultiplier: isBoss ? 1.5 : 1,
      });
    }

    return waves;
  }

  private pickEnemyType(phaseNumber: number, waveIndex: number, isBoss: boolean): EnemyType {
    const types = ENEMY_DEFINITIONS.map((entry) => entry.type);
    if (isBoss && phaseNumber >= 20) {
      return phaseNumber % 2 === 0 ? 'dragon' : 'wraith';
    }
    return types[(phaseNumber + waveIndex) % types.length];
  }

  private resolveUnlocks(
    mapId: MapId,
    mapIndex: number,
    phaseNumber: number,
    maxPhases: number,
  ): PhaseId[] {
    if (phaseNumber < maxPhases) {
      return [buildPhaseId(mapIndex, phaseNumber + 1)];
    }

    if (mapId === 'stendra') {
      return [buildPhaseId(2, 1)];
    }

    return [];
  }
}
