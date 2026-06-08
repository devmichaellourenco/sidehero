import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { getFeatureLevel } from '../../domain/upgrades/FeatureKey';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { mapPersistedGameState } from '../mappers/GameStateDtoMapper';
import { GameStateDto } from '../dto/GameStateDto';
import { applyEquipActions, planBestLoadout } from '../services/LoadoutPlanner';

export interface EquipBestLoadoutResult {
  state: GameStateDto;
  equippedCount: number;
}

export class EquipBestLoadoutUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly upgradeService: UpgradeService,
  ) {}

  async execute(gearIds?: string[]): Promise<EquipBestLoadoutResult> {
    const state = await this.repository.load();

    if (getFeatureLevel(state.upgradeLevels, 'optimize_loadout') < 1) {
      throw new Error('Otimizar equipe não desbloqueado');
    }

    const actions = planBestLoadout(state, gearIds);
    const { state: nextState, equippedCount } = applyEquipActions(state, actions);

    await this.repository.save(nextState);

    return {
      state: mapPersistedGameState(nextState, this.upgradeService),
      equippedCount,
    };
  }
}
