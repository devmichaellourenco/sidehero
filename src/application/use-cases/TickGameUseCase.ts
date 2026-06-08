import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { CombatService } from '../../domain/services/CombatService';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { mapPersistedGameState } from '../mappers/GameStateDtoMapper';
import { GameStateDto } from '../dto/GameStateDto';

export class TickGameUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly combatService: CombatService,
    private readonly upgradeService: UpgradeService,
  ) {}

  async execute(ticks = 1): Promise<GameStateDto> {
    let state = await this.repository.load();

    for (let i = 0; i < ticks; i++) {
      const result = this.combatService.executeTick(state);
      state = result.state;
    }

    await this.repository.save(state);
    return mapPersistedGameState(state, this.upgradeService);
  }
}
