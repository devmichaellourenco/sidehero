import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { mapPersistedGameState } from '../mappers/GameStateDtoMapper';
import { GameStateDto } from '../dto/GameStateDto';

export class GetGameStateUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly upgradeService: UpgradeService,
  ) {}

  async execute(): Promise<GameStateDto> {
    const state = await this.repository.load();
    return mapPersistedGameState(state, this.upgradeService);
  }
}
