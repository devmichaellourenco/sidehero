import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { mapGameStateToDto, GameStateDto } from '../dto/GameStateDto';
import { applyEquipActions, planBestLoadout } from '../services/LoadoutPlanner';

export interface EquipBestLoadoutResult {
  state: GameStateDto;
  equippedCount: number;
}

export class EquipBestLoadoutUseCase {
  constructor(private readonly repository: IGameStateRepository) {}

  async execute(gearIds?: string[]): Promise<EquipBestLoadoutResult> {
    const state = await this.repository.load();
    const actions = planBestLoadout(state, gearIds);
    const { state: nextState, equippedCount } = applyEquipActions(state, actions);

    await this.repository.save(nextState);

    return {
      state: mapGameStateToDto(nextState),
      equippedCount,
    };
  }
}
